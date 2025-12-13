const cron = require('node-cron');
const supabase = require('./supabaseService');

const initCleanupJob = () => {
    // Programar tarea: Todos los Domingos a las 00:00 (0 0 * * 0)
    // Para probar: Usar '* * * * *' (cada minuto)
    cron.schedule('0 0 * * 0', async () => {
        console.log('🧹 [Cleanup] Iniciando limpieza semanal de noticias antiguas...');

        try {
            // Calcular fecha límite (hace 7 días)
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            // Criterios: Más viejas de 7 días Y menos de 10 visitas
            // Primero, seleccionamos para loguear (opcional)
            const { data: toDelete, error: selectError } = await supabase
                .from('news')
                .select('id, title, views, created_at')
                .lt('created_at', oneWeekAgo.toISOString())
                .lt('views', 10);

            if (selectError) throw selectError;

            if (toDelete && toDelete.length > 0) {
                console.log(`🗑️ Se encontraron ${toDelete.length} noticias irrelevantes para eliminar.`);

                // Extraer IDs
                const idsToDelete = toDelete.map(n => n.id);

                // Eliminar
                const { error: deleteError } = await supabase
                    .from('news')
                    .delete()
                    .in('id', idsToDelete);

                if (deleteError) throw deleteError;

                console.log('✅ Limpieza completada exitosamente.');
            } else {
                console.log('✨ No hay noticias antiguas para limpiar esta semana.');
            }

        } catch (error) {
            console.error('❌ Error en el job de limpieza:', error.message);
        }
    });

    console.log('🕒 Servicio de limpieza programado (Domingos 00:00).');
};

module.exports = { initCleanupJob };
