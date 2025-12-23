import cron from 'node-cron';
import supabase from './supabaseService.js';

export const initCleanupJob = () => {
    // ... same code ...
    // Programar tarea: Todos los Domingos a las 00:00 (0 0 * * 0)
    // Para probar: Usar '* * * * *' (cada minuto)
    // Tarea 1: Limpieza semanal de NOTICIAS antiguas (Domingos 00:00)
    cron.schedule('0 0 * * 0', async () => {
        console.log('🧹 [Cleanup] Iniciando limpieza semanal de noticias antiguas...');
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const { data: toDelete, error: selectError } = await supabase
                .from('news')
                .select('id, title, views, created_at')
                .lt('created_at', oneWeekAgo.toISOString())
                .lt('views', 10);

            if (selectError) throw selectError;

            if (toDelete && toDelete.length > 0) {
                console.log(`🗑️ Se encontraron ${toDelete.length} noticias irrelevantes para eliminar.`);
                const idsToDelete = toDelete.map((n: any) => n.id);
                const { error: deleteError } = await supabase.from('news').delete().in('id', idsToDelete);
                if (deleteError) throw deleteError;
                console.log('✅ Limpieza de noticias completada.');
            } else {
                console.log('✨ No hay noticias antiguas para limpiar.');
            }
        } catch (error: any) {
            console.error('❌ Error en el job de limpieza de noticias:', error.message);
        }
    });

    // Tarea 2: Limpieza quincenal de LOGS (Todos los días a las 01:00 comprueba logs > 15 días)
    cron.schedule('0 1 * * *', async () => {
        console.log('🧹 [Cleanup] Iniciando limpieza de logs antiguos (> 15 días)...');
        try {
            const fifteenDaysAgo = new Date();
            fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

            // Supabase delete with filter
            const { error, count } = await supabase
                .from('system_logs')
                .delete({ count: 'exact' })
                .lt('created_at', fifteenDaysAgo.toISOString());

            if (error) throw error;

            if (count && count > 0) {
                console.log(`✅ Se eliminaron ${count} registros de auditoría antiguos.`);
            } else {
                console.log('✨ No hay logs antiguos para eliminar.');
            }
        } catch (error: any) {
            console.error('❌ Error en el job de limpieza de logs:', error.message);
        }
    });

    console.log('🕒 Servicio de limpieza programado (Domingos 00:00).');
};
