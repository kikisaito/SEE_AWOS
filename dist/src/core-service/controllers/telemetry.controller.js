"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportDailySnapshot = void 0;
const prisma_1 = __importDefault(require("../../shared/config/prisma"));
const bigquery_service_1 = require("../services/bigquery.service");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const exportDailySnapshot = async (req, res) => {
    try {
        const { googleAccessToken } = req.body;
        console.log('[INFO] Iniciando exportación a BigQuery...');
        if (!googleAccessToken) {
            return res.status(400).json({ error: "Falta el token de Google (googleAccessToken) en el body." });
        }
        const metrics = await prisma_1.default.$queryRaw `SELECT * FROM vista_exportacion_metricas;`;
        if (!metrics || metrics.length === 0) {
            return res.status(400).json({ message: "No hay métricas acumuladas para exportar. Genera tráfico en la app primero." });
        }
        const myProjectId = Number(process.env.TEAM_PROJECT_ID) || 6;
        const serializedRows = metrics.map(row => ({
            project_id: myProjectId,
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
            ingestion_timestamp: row.ingestion_timestamp
        }));
        console.log(`[DEBUG] Enviando ${serializedRows.length} filas a BigQuery bajo el proyecto ${myProjectId}.`);
        const bqErrors = await (0, bigquery_service_1.insertMetricsToBigQuery)(googleAccessToken, serializedRows);
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
        const backupsDir = path_1.default.join(__dirname, '../../../backups');
        if (!fs_1.default.existsSync(backupsDir)) {
            fs_1.default.mkdirSync(backupsDir, { recursive: true });
        }
        const filePath = path_1.default.join(backupsDir, fileName);
        const headers = Object.keys(serializedRows[0]).join(',');
        const csvRows = serializedRows.map(row => {
            return Object.values(row).map(value => {
                const strValue = String(value);
                return `"${strValue.replace(/"/g, '""')}"`;
            }).join(',');
        });
        const csvContent = [headers, ...csvRows].join('\n');
        fs_1.default.writeFileSync(filePath, csvContent, 'utf8');
        console.log(`[SUCCESS] Respaldo CSV generado exitosamente en: ${filePath}`);
        try {
            await prisma_1.default.$queryRawUnsafe('SELECT pg_stat_statements_reset();');
            console.log('[SUCCESS] Estadísticas de PostgreSQL reseteadas.');
        }
        catch (resetError) {
            console.error('[WARNING] Error al resetear PostgreSQL:', resetError);
        }
        return res.status(200).json({
            message: "Snapshot exportado a BigQuery y respaldado en CSV con éxito. Estadísticas reiniciadas.",
            backup_file: fileName
        });
    }
    catch (error) {
        console.error("Error Crítico:", error);
        return res.status(500).json({ error: "Error interno", details: error.message });
    }
};
exports.exportDailySnapshot = exportDailySnapshot;
//# sourceMappingURL=telemetry.controller.js.map