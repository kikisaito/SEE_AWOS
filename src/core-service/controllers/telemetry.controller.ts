import { Request, Response } from 'express';
import prisma from '../../shared/config/prisma';
import { insertMetricsToBigQuery } from '../services/bigquery.service';

export const exportDailySnapshot = async (req: Request, res: Response) => {
    try {
        const { googleAccessToken } = req.body;
        console.log('[INFO] Iniciando exportación a BigQuery...');

        if (!googleAccessToken) {
            return res.status(400).json({ error: "Falta el token de Google (googleAccessToken) en el body." });
        }

        // 1. Extraer datos de la vista (Asegúrate de haber corrido el DROP VIEW en pgAdmin)
        const metrics: any[] = await prisma.$queryRaw`SELECT * FROM vista_exportacion_metricas;`;

        if (!metrics || metrics.length === 0) {
            return res.status(400).json({ message: "No hay métricas acumuladas para exportar. Genera tráfico en la app primero." });
        }

        // 2. Serializar con limpieza estricta
        const serializedRows = metrics.map(row => ({
            project_id: Number(row.project_id) || 1,
            // Forzamos la fecha a YYYY-MM-DD sin errores de zona horaria
            snapshot_date: row.snapshot_date, 
            queryid: String(row.queryid),
            dbid: Number(row.dbid),
            userid: Number(row.userid),
            query: String(row.query),
            calls: Number(row.calls),
            total_exec_time_ms: parseFloat(row.total_exec_time_ms) || 0,
            mean_exec_time_ms: parseFloat(row.mean_exec_time_ms) || 0,
            min_exec_time_ms: parseFloat(row.min_exec_time_ms) || 0,
            max_exec_time_ms: parseFloat(row.max_exec_time_ms) || 0,
            stddev_exec_time_ms: parseFloat(row.stddev_exec_time_ms) || 0,
            rows_returned: Number(row.rows_returned) || 0,
            shared_blks_hit: Number(row.shared_blks_hit) || 0,
            shared_blks_read: Number(row.shared_blks_read) || 0,
            shared_blks_dirtied: Number(row.shared_blks_dirtied) || 0,
            shared_blks_written: Number(row.shared_blks_written) || 0,
            temp_blks_read: Number(row.temp_blks_read) || 0,
            temp_blks_written: Number(row.temp_blks_written) || 0,
            ingestion_timestamp: row.ingestion_timestamp // Viene como string desde la vista
        }));

        console.log(`[DEBUG] Enviando ${serializedRows.length} filas a BigQuery.`);

        // 3. Enviar a BigQuery
        const bqErrors = await insertMetricsToBigQuery(googleAccessToken, serializedRows);

        // 4. Confirmación y Reset
        if (bqErrors && bqErrors.length > 0) {
            console.error("❌ Errores detallados de BigQuery:", JSON.stringify(bqErrors, null, 2));
            return res.status(500).json({ 
                error: "BigQuery rechazó los datos.", 
                details: bqErrors 
            });
        }

        // Resetear solo si BigQuery aceptó todo
        await prisma.$executeRaw`SELECT pg_stat_statements_reset();`;

        return res.status(200).json({ 
            message: "Snapshot exportado con éxito. Estadísticas reiniciadas." 
        });

    } catch (error: any) {
        console.error("🔥 Error Crítico:", error);
        return res.status(500).json({ error: "Error interno", details: error.message });
    }
};