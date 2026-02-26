import { Request, Response } from 'express';
import prisma from '../../shared/config/prisma';
import { insertMetricsToBigQuery } from '../services/bigquery.service';

interface AuthRequest extends Request {
    user?: { userId: string };
}

export const exportDailySnapshot = async (req: Request, res: Response) => {
    try {
        // El token OAuth de Gmail que el usuario obtuvo en Flutter
        const { googleAccessToken } = req.body;

        if (!googleAccessToken) {
            return res.status(400).json({ error: "Falta el token de Google (googleAccessToken) en el body." });
        }

        
        const metrics: any[] = await prisma.$queryRaw`SELECT * FROM vista_exportacion_metricas;`;

        if (metrics.length === 0) {
            return res.status(400).json({ message: "No hay métricas acumuladas para exportar." });
        }

        const serializedRows = metrics.map(row => ({
            project_id: Number(row.project_id),
            snapshot_date: row.snapshot_date ? new Date(row.snapshot_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            queryid: String(row.queryid),
            dbid: Number(row.dbid),
            userid: Number(row.userid),
            query: String(row.query),
            calls: Number(row.calls),
            total_exec_time_ms: Number(row.total_exec_time_ms || 0),
            mean_exec_time_ms: Number(row.mean_exec_time_ms || 0),
            min_exec_time_ms: Number(row.min_exec_time_ms || 0),
            max_exec_time_ms: Number(row.max_exec_time_ms || 0),
            stddev_exec_time_ms: Number(row.stddev_exec_time_ms || 0),
            rows_returned: Number(row.rows_returned || 0),
            shared_blks_hit: Number(row.shared_blks_hit || 0),
            shared_blks_read: Number(row.shared_blks_read || 0),
            shared_blks_dirtied: Number(row.shared_blks_dirtied || 0),
            shared_blks_written: Number(row.shared_blks_written || 0),
            temp_blks_read: Number(row.temp_blks_read || 0),
            temp_blks_written: Number(row.temp_blks_written || 0)
        }));

        // 3. Enviar los datos al almacén central en BigQuery
        const bqErrors = await insertMetricsToBigQuery(googleAccessToken, serializedRows);

        // 4. CONFIRMACIÓN Y RESET CONDICIONAL 
        if (bqErrors && bqErrors.length > 0) {
            console.error("Errores en BigQuery:", JSON.stringify(bqErrors));
            return res.status(500).json({ 
                error: "Fallo al insertar en BigQuery. NO se reiniciaron las estadísticas.", 
                details: bqErrors 
            });
        }

        await prisma.$executeRaw`SELECT pg_stat_statements_reset();`;

        return res.status(200).json({ 
            message: "Snapshot exportado a BigQuery con éxito y estadísticas de PostgreSQL reiniciadas." 
        });

    } catch (error: any) {
        console.error("Error crítico en exportDailySnapshot:", error);
        return res.status(500).json({ error: "Error interno del servidor", details: error.message });
    }
};