import supabase from './supabaseService.js';
import { translateText } from './translationService.js';

interface PollOption {
    id: number;
    poll_id: number;
    label: string;
    label_en?: string | null;
    votes?: number;
}

interface Poll {
    id: number;
    title: string;
    title_en?: string | null;
    question: string;
    question_en?: string | null;
    is_active: boolean;
    closes_at?: string | null;
    created_at?: string;
    thread_id?: number | null;
    discord_link?: string | null;
    options?: PollOption[];
    totalVotes?: number;
    closesIn?: string;
}

interface CreatePollDTO {
    title: string;
    title_en?: string;
    question: string;
    question_en?: string;
    options: (string | { label: string; label_en?: string })[];
    closes_at?: string;
    thread_id?: number;
    discord_link?: string;
}

interface UpdatePollDTO {
    title: string;
    title_en?: string;
    question: string;
    question_en?: string;
    options: (string | { label: string; label_en?: string })[];
    closes_at?: string;
}

export const getActivePoll = async () => {
    // 1. Fetch active poll
    const { data: poll, error } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // maybeSingle allows null if 0 rows
    
    if (error) {
        console.error("Error fetching active poll:", error);
        return null;
    }
    if (!poll) return null;

    // 2. Fetch options
    const { data: options } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', poll.id)
        .order('id', { ascending: true });
    
    const safeOptions: PollOption[] = options || [];
        
    // Calculate total votes
    const totalVotes = safeOptions.reduce((sum: number, opt: PollOption) => sum + (opt.votes || 0), 0);
    
    // Calculate percentages
    const optionsWithPercent = safeOptions.map((opt: PollOption) => ({
        ...opt,
        percent: totalVotes === 0 ? 0 : Math.round(((opt.votes || 0) / totalVotes) * 100)
    }));

    // Calculate time remaining string
    let closesIn = 'Indefinido';
    if(poll.closes_at) {
        const total = Date.parse(poll.closes_at) - Date.now();
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        
        if (total <= 0) closesIn = "Finalizada";
        else if (days > 0) closesIn = `${days} días`;
        else closesIn = `${hours} horas`;
    }

    return {
        ...poll,
        options: optionsWithPercent,
        totalVotes,
        closesIn
    };
};

export const getPollById = async (id: number) => {
    const { data: poll, error } = await supabase.from('polls').select('*').eq('id', id).single();
    if(error || !poll) return null;

    const { data: options } = await supabase.from('poll_options').select('*').eq('poll_id', poll.id);
    const safeOptions: PollOption[] = options || [];
    const totalVotes = safeOptions.reduce((acc: number, o: PollOption) => acc + (o.votes||0), 0);
    
    // Calculate percentages
    const optionsWithPercent = safeOptions.map((opt: PollOption) => ({
        ...opt,
        percent: totalVotes === 0 ? 0 : Math.round(((opt.votes || 0) / totalVotes) * 100)
    }));

    // Time Calc
    let closesIn = 'Indefinido';
    if(poll.closes_at) {
        const total = Date.parse(poll.closes_at) - Date.now();
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        if (total <= 0) closesIn = "Finalizada";
        else closesIn = `${days} días`;
    }

    return { ...poll, options: optionsWithPercent, totalVotes, closesIn };
};

export const votePoll = async (pollId: number, optionId: number, userId: string) => {
    // 1. Check if the option exists and belongs to the poll
    const { data: option, error: fetchError } = await supabase
        .from('poll_options')
        .select('id, poll_id')
        .eq('id', optionId)
        .single();
        
    if (fetchError || !option) throw new Error("Option not found");
    if (option.poll_id !== pollId) throw new Error("Invalid option for this poll");

    // 2. Check if the poll is active and not expired
    const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select('is_active, closes_at')
        .eq('id', pollId)
        .single();

    if (pollError || !poll) throw new Error("Poll not found");
    if (!poll.is_active) throw new Error("La encuesta ya no está activa");
    if (poll.closes_at && new Date(poll.closes_at) <= new Date()) {
        throw new Error("La encuesta ha finalizado");
    }

    // 2. Insert into poll_votes (unique constraint handles double-voting)
    const { error: voteError } = await supabase
        .from('poll_votes')
        .insert([{
            poll_id: pollId,
            user_id: userId,
            option_id: optionId
        }]);

    if (voteError) {
        if (voteError.code === '23505') { // Unique violation
            throw new Error("Ya has votado en esta encuesta");
        }
        throw voteError;
    }
    
    // 3. fetch the updated count from poll_options (updated via trigger)
    const { data: updatedOption } = await supabase
        .from('poll_options')
        .select('votes')
        .eq('id', optionId)
        .single();

    return { success: true, votes: updatedOption?.votes || 0 };
};

export const createPoll = async ({ title, title_en, question, question_en, options, closes_at, thread_id, discord_link }: CreatePollDTO) => {
    // Deactivate others ONLY if Global (no thread_id)
    if (!thread_id) {
        await supabase.from('polls').update({ is_active: false }).is('thread_id', null).neq('id', -1); 
    }

    const finalTitleEn = title_en ? title_en : await translateText(title, 'en');
    const finalQuestionEn = question_en ? question_en : await translateText(question, 'en');

    const { data: poll, error } = await supabase
        .from('polls')
        .insert([{ 
            title, 
            question, 
            title_en: finalTitleEn,
            question_en: finalQuestionEn,
            is_active: true, 
            closes_at,
            thread_id: thread_id || null,
            discord_link: discord_link || null
        }])
        .select()
        .single();
    
    if (error) throw error;

    if (options && options.length > 0) {
        // Options can be string[] or { label, label_en }[]
        const optionsData = await Promise.all(options.map(async (opt) => {
            let label = '';
            let label_en = '';

            if (typeof opt === 'string') {
                label = opt;
                label_en = await translateText(opt, 'en');
            } else {
                label = opt.label;
                label_en = opt.label_en ? opt.label_en : await translateText(opt.label, 'en');
            }

            return {
                poll_id: poll.id,
                label,
                label_en,
                votes: 0
            };
        }));
        
        const { error: optError } = await supabase.from('poll_options').insert(optionsData);
        if (optError) throw optError;
    }

    return poll;
};

export const updatePoll = async (id: number, { title, title_en, question, question_en, options, closes_at }: UpdatePollDTO) => {
    // 1. Update main fields
    const finalTitleEn = title_en ? title_en : await translateText(title, 'en');
    const finalQuestionEn = question_en ? question_en : await translateText(question, 'en');

    const { data: poll, error } = await supabase
        .from('polls')
        .update({
            title,
            title_en: finalTitleEn,
            question,
            question_en: finalQuestionEn,
            closes_at
        })
        .eq('id', id)
        .select()
        .single();
    
    if (error) throw error;

    // 2. Diff Options
    
    // FETCH EXISTING
    const { data: existingOptions } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', id)
        .order('id', { ascending: true });
    
    const safeExisting: PollOption[] = existingOptions || [];

    // We will update first N options, create remaining, delete extras?
    if (options && Array.isArray(options)) {
        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            const label = typeof opt === 'string' ? opt : opt.label;
            const label_en = typeof opt === 'string' ? await translateText(opt, 'en') : (opt.label_en || await translateText(opt.label, 'en'));

            if (safeExisting && i < safeExisting.length) {
                // UPDATE existing
                await supabase
                    .from('poll_options')
                    .update({ label, label_en })
                    .eq('id', safeExisting[i].id);
            } else {
                // CREATE new
                await supabase
                    .from('poll_options')
                    .insert({
                        poll_id: id,
                        label,
                        label_en,
                        votes: 0
                    });
            }
        }

        // DELETE extras if new list is shorter
        if (safeExisting && safeExisting.length > options.length) {
             const toDelete = safeExisting.slice(options.length).map((o) => o.id);
             await supabase.from('poll_options').delete().in('id', toDelete);
        }
    }

    return poll;
};

export const closePoll = async (id: number) => {
    const { error } = await supabase
        .from('polls')
        .update({ is_active: false })
        .eq('id', id);
    if (error) throw error;
    return { success: true };
};

export const deletePoll = async (id: number) => {
    // 1. Delete options first (manual cascade)
    await supabase.from('poll_options').delete().eq('poll_id', id);
    // 2. Delete poll
    const { error } = await supabase.from('polls').delete().eq('id', id);
    if(error) throw error;
    return { success: true };
};

export const getPolls = async ({ page = 1, limit = 10 }: { page: number; limit: number }) => {
    const offset = (page - 1) * limit;
    
    // Fetch polls
    const { data: polls, count, error } = await supabase
        .from('polls')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;

    // Fetch options for these polls to calculate total votes
    if (!polls || polls.length === 0) {
        return { data: [], total: 0, page, totalPages: 0 };
    }

    // Cast as Poll[] to avoid 'any' issues downstream
    const safePolls: Poll[] = polls as Poll[];

    const pollIds = safePolls.map((p) => p.id);
    const { data: options } = await supabase
        .from('poll_options')
        .select('poll_id, votes')
        .in('poll_id', pollIds);
    
    const safeOptions: Partial<PollOption>[] = options || [];

    // enrich polls
    const enrichedPolls = safePolls.map((p) => {
        const pOptions = safeOptions.filter((o) => o.poll_id === p.id);
        const totalVotes = pOptions.reduce((acc: number, curr: Partial<PollOption>) => acc + (curr.votes || 0), 0);
        return { ...p, totalVotes };
    });

    return {
        data: enrichedPolls,
        total: count,
        page,
        totalPages: Math.ceil((count || 0) / limit)
    };
};
