import { Request, Response } from 'express';
import prisma from '../../shared/config/prisma';
import { insertMetricsToBigQuery } from '../services/bigquery.service';
import fs from 'fs';
import path from 'path';

export const exportDailySnapshot = async (req: Request, res: Response) => {
    try {
        const { googleAccessToken } = req.body;
        console.log('[INFO] Iniciando exportación a BigQuery...');

        if (!googleAccessToken) {
            return res.status(400).json({ error: "Falta el token de Google (googleAccessToken) en el body." });
        }

        const metrics: any[] = await prisma.$queryRaw`SELECT * FROM vista_exportacion_metricas;`;

        if (!metrics || metrics.length === 0) {
            return res.status(400).json({ message: "No hay métricas acumuladas para exportar. Genera tráfico en la app primero." });
        }

    
        const myProjectId = Number(process.env.TEAM_PROJECT_ID) || 6;

        const serializedRows = metrics.map(row => ({
           
            project_id: myProjectId, 
            snapshot_date: new Date(row.snapshot_date).toISOString().split('T')[0],
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
            ingestion_timestamp: row.ingestion_timestamp 
        }));

        console.log(`[DEBUG] Enviando ${serializedRows.length} filas a BigQuery bajo el proyecto ${myProjectId}.`);

        const bqErrors = await insertMetricsToBigQuery(googleAccessToken, serializedRows);

        if (bqErrors && bqErrors.length > 0) {
            console.error("Errores detallados de BigQuery:", JSON.stringify(bqErrors, null, 2));
            return res.status(500).json({ 
                error: "BigQuery rechazó los datos.", 
                details: bqErrors 
            });
        }

        
        const today = new Date();
        const dateString = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
        const fileName = `project_${myProjectId}_${dateString}.csv`;
        
        const backupsDir = path.join(__dirname, '../../../backups'); 
        
        if (!fs.existsSync(backupsDir)){
            fs.mkdirSync(backupsDir, { recursive: true });
        }

        const filePath = path.join(backupsDir, fileName);

        const headers = Object.keys(serializedRows[0]).join(',');
        const csvRows = serializedRows.map(row => {
            return Object.values(row).map(value => {
                const strValue = String(value);
                return `"${strValue.replace(/"/g, '""')}"`;
            }).join(',');
        });
        const csvContent = [headers, ...csvRows].join('\n');

        fs.writeFileSync(filePath, csvContent, 'utf8');
        console.log(`[SUCCESS] Respaldo CSV generado exitosamente en: ${filePath}`);

      
        try {
            await prisma.$queryRawUnsafe('SELECT pg_stat_statements_reset();');
            console.log('[SUCCESS] Estadísticas de PostgreSQL reseteadas.');
        } catch (resetError) {
            console.error('[WARNING] Error al resetear PostgreSQL:', resetError);
        }

        return res.status(200).json({ 
            message: "Snapshot exportado a BigQuery y respaldado en CSV con éxito. Estadísticas reiniciadas.",
            backup_file: fileName
        });

    } catch (error: any) {
        console.error("Error Crítico:", error);
        return res.status(500).json({ error: "Error interno", details: error.message });
    }
};





export const getClinicalHypothesis = async (req: Request, res: Response) => {
    try {
        console.log('[INFO] Calculando métricas de hipótesis clínica...');

        // 1. Obtener todas las sesiones de crisis donde SE USÓ una cápsula
        //    Y que además tengan una evaluación final completada.
        const sessionsWithCapsules = await prisma.crisisSession.findMany({
            where: {
                usedCapsuleId: { not: null },
                finalEvaluationId: { not: null }
            },
            include: {
                finalEvaluation: true // Incluimos la evaluación para saber si mejoró
            }
        });

        const totalUsed = sessionsWithCapsules.length;

        // Si nadie ha usado cápsulas y evaluado, evitamos división por cero
        if (totalUsed === 0) {
            return res.status(200).json({
                success: true,
                total_capsules_used_in_crisis: 0,
                improvement_percentage: 0,
                message: "No hay datos suficientes para calcular la hipótesis aún."
            });
        }

        // 2. Contar en cuántas de esas sesiones el usuario reportó mejoría
        // Asumiendo que las descripciones en EvaluationScaleCatalog son exactas a tu seed
        let improvedCount = 0;
        
        sessionsWithCapsules.forEach(session => {
            const evalDesc = session.finalEvaluation?.description;
            if (evalDesc === 'Mejor' || evalDesc === 'Un poco mejor') {
                improvedCount++;
            }
        });

        // 3. Calcular el porcentaje de éxito (La Hipótesis)
        const improvementPercentage = (improvedCount / totalUsed) * 100;

        return res.status(200).json({
            success: true,
            total_capsules_used_in_crisis: totalUsed,
            improved_sessions: improvedCount,
            improvement_percentage: Number(improvementPercentage.toFixed(2)), // Redondeado a 2 decimales
            hypothesis_validated: improvementPercentage >= 60 // Tu umbral del 60%
        });

    } catch (error: any) {
        console.error("[ERROR] Fallo al calcular hipótesis:", error);
        return res.status(500).json({ error: "Error interno al calcular métricas", details: error.message });
    }
};







export const downloadLastCSV = (req: Request, res: Response) => {
    try {
        console.log('[INFO] Solicitud para descargar el CSV del día...');
        
        // 1. Reconstruimos el nombre del archivo de hoy, igual que en el snapshot
        const myProjectId = Number(process.env.TEAM_PROJECT_ID) || 6;
        const today = new Date();
        const dateString = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
        const fileName = `project_${myProjectId}_${dateString}.csv`;
        
        // 2. Buscamos la ruta exacta en la carpeta de backups
        const filePath = path.join(__dirname, '../../../backups', fileName);

        // 3. Verificamos si el archivo existe y lo enviamos
        if (fs.existsSync(filePath)) {
            return res.download(filePath, fileName); // res.download fuerza la descarga en el navegador
        } else {
            return res.status(404).json({ 
                error: "No se encontró el CSV de hoy. Asegúrate de ejecutar el 'SYNC TO BIGQUERY' primero." 
            });
        }
    } catch (error: any) {
        console.error("[ERROR] Fallo al descargar el CSV:", error);
        return res.status(500).json({ error: "Error interno al procesar la descarga." });
    }
};








export const getSnapshotPreview = async (req: Request, res: Response) => {
    try {
        console.log('[INFO] Obteniendo vista previa del snapshot para el radar...');

        const preview: any[] = await prisma.$queryRaw`
            SELECT query, calls, total_exec_time_ms, mean_exec_time_ms 
            FROM vista_exportacion_metricas 
            ORDER BY calls DESC 
            LIMIT 50;
        `;

        // Serialización obligatoria para evitar el error de BigInt
        const serializedPreview = preview.map(row => ({
            query: String(row.query),
            calls: Number(row.calls),
            total_exec_time_ms: parseFloat(row.total_exec_time_ms) || 0,
            mean_exec_time_ms: parseFloat(row.mean_exec_time_ms) || 0
        }));

        return res.status(200).json({ 
            success: true,
            total_queries: serializedPreview.length,
            data: serializedPreview
        });

    } catch (error: any) {
        console.error("[ERROR] Fallo al obtener preview del snapshot:", error);
        return res.status(500).json({ error: "Error interno al leer la vista." });
    }
};