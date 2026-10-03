import { Request, Response } from 'express';
import { WebhookClient, EmbedBuilder } from 'discord.js';
import supabase from '../config/supabaseClient.js';
import { ensureString } from '../utils/typeUtils.js';

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const DONATIONS_TABLE = 'donations';
const DEFAULT_CURRENCY = 'USD';

interface DonationRecord {
    amount?: number | string;
    created_at?: string;
    [key: string]: unknown;
}

// --- Private Helper Functions ---
const insertDonationRecord = async (donationData: Record<string, unknown>) => {
    return await supabase.from(DONATIONS_TABLE).insert([donationData]).select().single();
};

const updateDonationRecord = async (id: number, updateData: Record<string, unknown>) => {
    return await supabase.from(DONATIONS_TABLE).update(updateData).eq('id', id).select().single();
};

const deleteDonationRecord = async (id: number) => {
    return await supabase.from(DONATIONS_TABLE).delete().eq('id', id);
};

const processDonationStats = (data: DonationRecord[]) => {
    const totalAmount = data.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const currentYear = now.getFullYear();
    
    const prevDate = new Date();
    prevDate.setMonth(now.getMonth() - 1);
    const prevMonthIdx = prevDate.getMonth();
    const prevYear = prevDate.getFullYear();

    let currentMonthParams = 0;
    let prevMonthParams = 0;
    const months: Record<string, number> = {};
    
    data.forEach(d => {
        const date = new Date(d.created_at || 0);
        const amt = Number(d.amount) || 0;
        
        const key = `${date.toLocaleString('default', { month: 'short' })}`;
        months[key] = (months[key] || 0) + amt;

        if (date.getMonth() === currentMonthIdx && date.getFullYear() === currentYear) {
            currentMonthParams += amt;
        }

        if (date.getMonth() === prevMonthIdx && date.getFullYear() === prevYear) {
            prevMonthParams += amt;
        }
    });

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

    return { totalAmount, currentMonthParams, percentChange, monthlyStats };
};

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
        const { data, error } = await insertDonationRecord({ 
            message_id: `test_${Date.now()}`,
            from_name: username || 'Donador de Prueba', 
            amount: amount || 5.00, 
            currency: currency || DEFAULT_CURRENCY, 
            message: message || '¡Esto es una prueba del sistema de donaciones! 🚀', 
            is_public: true,
            created_at: new Date().toISOString()
        });

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
        const page = Number.parseInt(ensureString(req.query.page), 10) || 1;
        const limit = Number.parseInt(ensureString(req.query.limit), 10) || 20;
        const search = ensureString(req.query.search);

        let query = supabase
            .from(DONATIONS_TABLE)
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

export const createDonation = async (req: Request, res: Response) => {
    try {
        const { from_name, amount, currency, message, is_public, email } = req.body;
        
        const { data, error } = await insertDonationRecord({ 
            from_name, 
            amount, 
            currency: currency || DEFAULT_CURRENCY, 
            message, 
            is_public: is_public ?? true, 
            buyer_email: email,
            created_at: new Date()
        });

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
        const id = Number.parseInt(ensureString(req.params.id), 10);
        const { data, error } = await updateDonationRecord(id, req.body);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error updating donation:', error);
        res.status(500).json({ message: 'Error updating donation' });
    }
};

export const deleteDonation = async (req: Request, res: Response) => {
    try {
        const id = Number.parseInt(ensureString(req.params.id), 10);
        const { error } = await deleteDonationRecord(id);

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
            .from(DONATIONS_TABLE)
            .select('amount, created_at, currency');

        if (error) throw error;

        const stats = processDonationStats(data);

        res.json({
            totalAmount: stats.totalAmount,
            currentMonth: stats.currentMonthParams.toFixed(2),
            percentChange: Math.round(stats.percentChange),
            count: data.length,
            monthlyStats: stats.monthlyStats
        });
    } catch (error) {
        console.error('Error fetching donation stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};
