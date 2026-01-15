import { Request, Response } from 'express';
import supabase_internal from '../services/supabaseService.js';

const supabase = supabase_internal;

export const linkAccount = async (req: Request, res: Response) => {
    try {
        const { code } = req.body;
        const userId = req.user?.id; 

        if (!userId) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        if (!code) {
            return res.status(400).json({ message: 'Falta el código' });
        }

        if (!supabase) return res.status(503).json({ message: 'Error de configuración del servidor' });

        // 1. Verify Code in Supabase (universal_links)
        const { data: results, error: fetchError } = await supabase
            .from('universal_links')
            .select('*')
            .eq('code', code.toUpperCase());

        if (fetchError) throw fetchError;

        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'Código inválido o inexistente.' });
        }

        const verification = results[0];
        if (Date.now() > Number(verification.expires_at)) {
            await supabase.from('universal_links').delete().eq('code', code.toUpperCase());
            return res.status(400).json({ message: 'El código ha expirado.' });
        }

        // 2. Link account logic (Supabase Profiles)
        // If the code came from Discord bot or Minecraft plugin
        if (verification.source === 'discord') {
             // In this case, source_id is the Discord ID
             await supabase
                .from('profiles')
                .update({ social_discord: null, discord_tag: null, social_avatar_url: null })
                .eq('social_discord', verification.source_id);

             const { error: linkError } = await supabase
                .from('profiles')
                .update({ 
                    social_discord: verification.source_id, 
                    discord_tag: verification.player_name,
                    social_avatar_url: verification.avatar_url
                })
                .eq('id', userId);

             if (linkError) throw linkError;
        } else if (verification.source === 'minecraft') {
             // In this case, source_id is the Minecraft UUID
             await supabase
                .from('profiles')
                .update({ minecraft_uuid: null, minecraft_name: null })
                .eq('minecraft_uuid', verification.source_id);

             const { error: linkError } = await supabase
                .from('profiles')
                .update({ 
                    minecraft_uuid: verification.source_id, 
                    minecraft_name: verification.player_name 
                })
                .eq('id', userId);

             if (linkError) throw linkError;
        }

        // 3. Delete Code
        await supabase.from('universal_links').delete().eq('code', code.toUpperCase());

        res.json({ success: true, message: 'Cuenta vinculada exitosamente', source: verification.source });

    } catch (error) {
        console.error('Link Error:', error);
        res.status(500).json({ message: 'Error al vincular cuenta' });
    }
};
