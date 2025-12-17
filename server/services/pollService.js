const supabase = require('./supabaseService');

const getActivePoll = async () => {
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
    
    const safeOptions = options || [];
        
    // Calculate total votes
    const totalVotes = safeOptions.reduce((sum, opt) => sum + (opt.votes || 0), 0);
    
    // Calculate percentages
    const optionsWithPercent = safeOptions.map(opt => ({
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

const getPollById = async (id) => {
    const { data: poll, error } = await supabase.from('polls').select('*').eq('id', id).single();
    if(error || !poll) return null;

    const { data: options } = await supabase.from('poll_options').select('*').eq('poll_id', poll.id);
    const safeOptions = options || [];
    const totalVotes = safeOptions.reduce((acc, o) => acc + (o.votes||0), 0);
    
    // Calculate percentages
    const optionsWithPercent = safeOptions.map(opt => ({
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

const votePoll = async (pollId, optionId) => {
    // Naive fetch-update
    const { data: option, error: fetchError } = await supabase
        .from('poll_options')
        .select('votes')
        .eq('id', optionId)
        .single();
        
    if (fetchError || !option) throw new Error("Option not found");

    const newVotes = (option.votes || 0) + 1;
    
    const { error } = await supabase
        .from('poll_options')
        .update({ votes: newVotes })
        .eq('id', optionId);

    if (error) throw error;
    
    return { success: true, votes: newVotes };
};

const createPoll = async ({ title, question, options, closes_at, thread_id, discord_link }) => {
    // Deactivate others ONLY if Global (no thread_id)
    if (!thread_id) {
        await supabase.from('polls').update({ is_active: false }).is('thread_id', null).neq('id', -1); 
    }

    const { data: poll, error } = await supabase
        .from('polls')
        .insert([{ 
            title, 
            question, 
            is_active: true, 
            closes_at,
            thread_id: thread_id || null,
            discord_link: discord_link || null
        }])
        .select()
        .single();
    
    if (error) throw error;

    if (options && options.length > 0) {
        const optionsData = options.map(label => ({
            poll_id: poll.id,
            label,
            votes: 0
        }));
        
        const { error: optError } = await supabase.from('poll_options').insert(optionsData);
        if (optError) throw optError;
    }

    return poll;
};

const closePoll = async (id) => {
    const { error } = await supabase
        .from('polls')
        .update({ is_active: false })
        .eq('id', id);
    if (error) throw error;
    return { success: true };
};

const deletePoll = async (id) => {
    // 1. Delete options first (manual cascade)
    await supabase.from('poll_options').delete().eq('poll_id', id);
    // 2. Delete poll
    const { error } = await supabase.from('polls').delete().eq('id', id);
    if(error) throw error;
    return { success: true };
};

module.exports = { getActivePoll, votePoll, createPoll, closePoll, getPollById, deletePoll };
