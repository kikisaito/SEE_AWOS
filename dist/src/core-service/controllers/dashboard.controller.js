"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingReflections = exports.getDashboardSummary = void 0;
const prisma_1 = __importDefault(require("../../shared/config/prisma"));
const getDashboardSummary = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const totalVictories = await prisma_1.default.userVictory.count({
            where: {
                userId,
                occurredAt: {
                    gte: thirtyDaysAgo //  (Mayor o igual a hace 30 días)
                }
            }
        });
        // 3. Contar Cápsulas Activas (Esto es estado actual, no depende del tiempo)
        const activeCapsules = await prisma_1.default.capsule.count({
            where: {
                userId,
                isActive: true
            }
        });
        const recentCrisis = await prisma_1.default.crisisSession.count({
            where: {
                userId,
                startedAt: {
                    gte: thirtyDaysAgo
                }
            }
        });
        res.json({
            metrics: {
                totalVictories,
                activeCapsules,
                recentCrisis
            },
            period: "Últimos 30 días"
        });
    }
    catch (error) {
        console.error("Error dashboard:", error);
        res.status(500).json({ error: "Error al generar el reporte" });
    }
};
exports.getDashboardSummary = getDashboardSummary;
const getPendingReflections = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const pending = await prisma_1.default.crisisSession.findMany({
            where: {
                userId,
                isReflectionCompleted: false // Solo las que no se han llenado
            },
            select: {
                crisisId: true,
                startedAt: true,
                intensityLevel: true
            },
            orderBy: { startedAt: 'desc' }
        });
        res.json({ count: pending.length, data: pending });
    }
    catch (error) {
        res.status(500).json({ error: "Error obteniendo pendientes" });
    }
};
exports.getPendingReflections = getPendingReflections;
//# sourceMappingURL=dashboard.controller.js.map