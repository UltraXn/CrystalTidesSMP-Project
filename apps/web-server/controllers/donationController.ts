import { Request, Response } from 'express';
import { WebhookClient, EmbedBuilder } from 'discord.js';
import supabase from '../config/supabaseClient.js';
import { ensureString } from '../utils/typeUtils.js';

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

// Helper to send Discord Webhook
interface WebhookDonation {
    from_name: string;
    amount: number;
    currency: string;
    message?: string;
}

const sendDiscordWebhook = async (donation: WebhookDonation) => {
    if (!webhookUrl) return;
    try {
        const webhookClient = new WebhookClient({ url: webhookUrl });
        const embed = new EmbedBuilder()
            .setTitle('🎉 ¡Nueva Donación!')
            .setColor(0xFFD700)
            .setDescription(`**${donation.from_name || 'Anónimo'}** ha donado **${donation.amount} ${donation.currency}**!`)
            .addFields({ name: 'Mensaje', value: donation.message || '¡Muchas gracias por el apoyo! 🌊' })
            .setTimestamp()
            .setFooter({ text: 'CrystalTides SMP' });

        await webhookClient.send({
            embeds: [embed],
        });
    } catch (error) {
        console.error('Error sending webhook:', error);
    }
}

export const testDonation = async (req: Request, res: Response) => {
    try {
        const { username, amount, currency, message } = req.body;
        
        // 1. Insert into Supabase so it shows up on the frontend real-time carousel
        const { data, error } = await supabase
            .from('donations')
            .insert([{ 
                message_id: `test_${Date.now()}`,
                from_name: username || 'Donador de Prueba', 
                amount: amount || 5.00, 
                currency: currency || 'USD', 
                message: message || '¡Esto es una prueba del sistema de donaciones! 🚀', 
                is_public: true,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        // 2. Send Discord Webhook (Existing behavior)
        await sendDiscordWebhook({
            from_name: data.from_name,
            amount: data.amount,
            currency: data.currency,
            message: data.message
        });

        res.json({ success: true, message: 'Test donation recorded and alert sent', data });
    } catch (error) {
        console.error('Error in testDonation:', error);
        res.status(500).json({ success: false, message: 'Failed to process test donation' });
    }
};

export const getDonations = async (req: Request, res: Response) => {
    try {
        const page = parseInt(ensureString(req.query.page)) || 1;
        const limit = parseInt(ensureString(req.query.limit)) || 20;
        const search = ensureString(req.query.search);

        let query = supabase
            .from('donations')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (search) {
            query = query.ilike('from_name', `%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            data: data,
            total: count || 0,
            page,
            totalPages: count ? Math.ceil(count / limit) : 1
        });
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ message: 'Error fetching donations' });
    }
};

export const getPublicDonations = async (req: Request, res: Response) => {
    try {
        const selectFields = 'id, message_id, from_name, created_at, currency, amount, message, message_en, is_public';
        const limitParam = typeof req.query.limit === 'string' ? req.query.limit.trim().toLowerCase() : '';

        if (limitParam === 'all') {
            const pageSize = 1000;
            let start = 0;
            let allRows: Record<string, unknown>[] = [];

            while (true) {
                const { data, error } = await supabase
                    .from('donations')
                    .select(selectFields)
                    .eq('is_public', true)
                    .order('created_at', { ascending: false })
                    .range(start, start + pageSize - 1);

                if (error) throw error;
                if (!data || data.length === 0) break;

                allRows = allRows.concat(data);
                if (data.length < pageSize) break;

                start += pageSize;
            }

            return res.json({
                data: allRows,
                total: allRows.length
            });
        }

        const rawLimit = Number.parseInt(String(req.query.limit ?? '20'), 10);
        const limit = Number.isNaN(rawLimit) ? 20 : Math.min(Math.max(rawLimit, 1), 1000);

        const { data, error } = await supabase
            .from('donations')
            .select(selectFields)
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        res.json({
            data: data || [],
            total: data?.length || 0
        });
    } catch (error) {
        console.error('Error fetching public donations:', error);
        res.status(500).json({ message: 'Error fetching public donations' });
    }
};

export const createDonation = async (req: Request, res: Response) => {
    try {
        const fallbackName = typeof req.body?.donor_name === 'string' ? req.body.donor_name : undefined;
        const fromName = typeof req.body?.from_name === 'string' ? req.body.from_name : fallbackName;
        const amount = Number(req.body?.amount);
        const currency = typeof req.body?.currency === 'string' ? req.body.currency : 'USD';
        const message = typeof req.body?.message === 'string' ? req.body.message : '';
        const isPublic = req.body?.is_public ?? true;
        const fallbackEmail = typeof req.body?.email === 'string' ? req.body.email : undefined;
        const buyerEmail = typeof req.body?.buyer_email === 'string' ? req.body.buyer_email : fallbackEmail;

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Invalid donation amount' });
        }
        
        const { data, error } = await supabase
            .from('donations')
            .insert([{ 
                from_name: fromName || 'Anonymous',
                amount, 
                currency: currency || 'USD',
                message, 
                is_public: isPublic, 
                buyer_email: buyerEmail,
                created_at: new Date()
            }])
            .select()
            .single();

        if (error) throw error;

        // Optionally trigger webhook for real manual donations too
        if (data) await sendDiscordWebhook(data);

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating donation:', error);
        res.status(500).json({ message: 'Error creating donation' });
    }
};

export const updateDonation = async (req: Request, res: Response) => {
    try {
        const id = parseInt(ensureString(req.params.id));
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: 'Invalid donation id' });
        }

        const updates: Record<string, unknown> = {};
        const fallbackName = typeof req.body?.donor_name === 'string' ? req.body.donor_name : undefined;
        const fromName = typeof req.body?.from_name === 'string' ? req.body.from_name : fallbackName;
        if (fromName !== undefined) updates.from_name = fromName;

        if (req.body?.amount !== undefined) {
            const amount = Number(req.body.amount);
            if (!Number.isFinite(amount) || amount <= 0) {
                return res.status(400).json({ message: 'Invalid donation amount' });
            }
            updates.amount = amount;
        }

        if (typeof req.body?.currency === 'string') updates.currency = req.body.currency;
        if (typeof req.body?.message === 'string') updates.message = req.body.message;
        if (typeof req.body?.type === 'string') updates.type = req.body.type;
        if (typeof req.body?.source === 'string') updates.type = req.body.source;
        if (req.body?.is_public !== undefined) updates.is_public = Boolean(req.body.is_public);

        const fallbackEmail = typeof req.body?.email === 'string' ? req.body.email : undefined;
        const buyerEmail = typeof req.body?.buyer_email === 'string' ? req.body.buyer_email : fallbackEmail;
        if (buyerEmail !== undefined) updates.buyer_email = buyerEmail;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid donation fields to update' });
        }
        const { data, error } = await supabase
            .from('donations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error updating donation:', error);
        res.status(500).json({ message: 'Error updating donation' });
    }
};

export const deleteDonation = async (req: Request, res: Response) => {
    try {
        const id = parseInt(ensureString(req.params.id));
        const { error } = await supabase
            .from('donations')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting donation:', error);
        res.status(500).json({ message: 'Error deleting donation' });
    }
};

export const getDonationStats = async (req: Request, res: Response) => {
    try {
        // Fetch all amounts for calc (warning: heavy if many rows, better to use RPC or created aggregated view later)
        const { data, error } = await supabase
            .from('donations')
            .select('amount, created_at, currency');

        if (error) throw error;

        const totalAmount = data.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        
        // Detailed Month Calc
        const now = new Date();
        const currentMonthIdx = now.getMonth();
        const currentYear = now.getFullYear();
        
        const prevDate = new Date();
        prevDate.setMonth(now.getMonth() - 1);
        const prevMonthIdx = prevDate.getMonth();
        const prevYear = prevDate.getFullYear();

        let currentMonthParams = 0;
        let prevMonthParams = 0;

        // Basic monthly aggregation in JS
        const months: Record<string, number> = {};
        
        data.forEach(d => {
            const date = new Date(d.created_at);
            const amt = Number(d.amount) || 0;
            
            // Monthly Agg
            const key = `${date.toLocaleString('default', { month: 'short' })}`; // e.g. "Dec"
            months[key] = (months[key] || 0) + amt;

            // Current Month Calc
            if (date.getMonth() === currentMonthIdx && date.getFullYear() === currentYear) {
                currentMonthParams += amt;
            }

            // Prev Month Calc
            if (date.getMonth() === prevMonthIdx && date.getFullYear() === prevYear) {
                prevMonthParams += amt;
            }
        });

        // Calculate Percent Change
        let percentChange = 0;
        if (prevMonthParams === 0) {
            percentChange = currentMonthParams > 0 ? 100 : 0;
        } else {
            percentChange = ((currentMonthParams - prevMonthParams) / prevMonthParams) * 100;
        }

        const monthlyStats = Object.keys(months).map(month => ({
            month,
            amount: months[month]
        }));

        res.json({
            totalAmount,
            currentMonth: currentMonthParams.toFixed(2),
            percentChange: Math.round(percentChange),
            count: data.length,
            monthlyStats
        });
    } catch (error) {
        console.error('Error fetching donation stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};
