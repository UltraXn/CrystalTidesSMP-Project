import supabase from './supabaseService.js';
import { translateText } from './translationService.js';
import { validateSuggestion } from './suggestionValidatorService.js';
import { refundGachaBalance as addGachaBalance } from './gachaBalanceService.js';

interface SuggestionData {
    nickname: string;
    type: string;
    message: string;
    user_id?: string;
}

export const createSuggestion = async (data: SuggestionData) => {
    const validation = await validateSuggestion(data.message);

    if (!validation.isValid) {
        return {
            error: true,
            isValid: false,
            message: validation.explanation,
            engine: validation.engine
        };
    }

    let messageEn = '';
    try {
        messageEn = await translateText(data.message, 'en');
    } catch {
        messageEn = data.message;
    }

    const { data: result, error } = await supabase
        .from('suggestions')
        .insert([{
            nickname: data.nickname || 'Anónimo',
            type: data.type || 'General',
            message: data.message,
            message_en: messageEn,
            user_id: data.user_id || null,
            status: 'pending',
            auto_validated: true,
            kc_awarded: 100
        }])
        .select()
        .single();

    if (error) throw error;

    let newBalance: number | undefined;
    if (data.user_id) {
        try {
            await addGachaBalance(data.user_id, 100);
        } catch (kcError) {
            console.error('[SuggestionService] Failed to award instant 100 KC:', kcError);
        }
    }

    return {
        ...result,
        validation,
        kc_awarded: 100,
        newBalance
    };
};

export const getSuggestions = async () => {
    const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const deleteSuggestion = async (id: number) => {
    const { error } = await supabase.from('suggestions').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
};

async function awardApprovalBonusAndBadge(userId: string): Promise<void> {
    try {
        await addGachaBalance(userId, 500);

        const { data: profile } = await supabase
            .from('profiles')
            .select('badges')
            .eq('id', userId)
            .single();

        const currentBadges: string[] = Array.isArray(profile?.badges) ? profile.badges : [];
        if (!currentBadges.includes('Mente Creativa')) {
            const updatedBadges = [...currentBadges, 'Mente Creativa'];
            await supabase
                .from('profiles')
                .update({ badges: updatedBadges })
                .eq('id', userId);
        }
    } catch (kcError) {
        console.error('[SuggestionService] Failed to award 500 KC approval bonus or badge:', kcError);
    }
}

async function queueInGameBroadcast(authorNick: string): Promise<void> {
    try {
        await supabase.from('web_pending_commands').insert([{
            command: `broadcast &a&l[SUGERENCIA APROBADA] &fLa propuesta de &e${authorNick}&f fue aprobada. ¡+500 KC!`,
            created_at: new Date().toISOString()
        }]);
    } catch (cmdError) {
        console.error('[SuggestionService] Failed to queue in-game broadcast command:', cmdError);
    }
}

async function notifyDiscordWebhook(authorNick: string, message: string): Promise<void> {
    const discordWebhook = process.env.DISCORD_SUGGESTIONS_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
    if (!discordWebhook) return;

    try {
        await fetch(discordWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: '💡 Sugerencia Aprobada',
                    description: `**Propuesta de ${authorNick}:**\n"${message}"`,
                    color: 0x22c55e,
                    fields: [
                        { name: 'Recompensa', value: '+500 KilluCoins (KC)', inline: true },
                        { name: 'Insignia', value: '🎨 Mente Creativa', inline: true }
                    ],
                    timestamp: new Date().toISOString()
                }]
            })
        });
    } catch (webhookError) {
        console.error('[SuggestionService] Failed to trigger Discord webhook:', webhookError);
    }
}

export const updateStatus = async (id: number, status: string) => {
    const { data: existing, error: fetchError } = await supabase
        .from('suggestions')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
        .from('suggestions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    const isNewlyApproved = (status === 'approved' || status === 'implemented') && existing.status !== status;
    if (isNewlyApproved) {
        const authorNick = existing.nickname || 'Un usuario';
        if (existing.user_id) {
            await awardApprovalBonusAndBadge(existing.user_id);
        }
        await queueInGameBroadcast(authorNick);
        await notifyDiscordWebhook(authorNick, existing.message);
    }

    return data;
};
