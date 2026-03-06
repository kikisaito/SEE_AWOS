"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVictories = exports.getVictoryTypes = void 0;
const prisma_1 = __importDefault(require("../../shared/config/prisma"));
const getVictoryTypes = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const types = await prisma_1.default.victoryTypeCatalog.findMany({
        where: {
            OR: [
                { userId: null },
                { userId: userId } // capsulas de usuario
            ]
        },
        orderBy: { victoryTypeId: 'asc' }
    });
    res.json(types);
};
exports.getVictoryTypes = getVictoryTypes;
const registerVictories = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { victoryTypeIds, newCustomVictoryName } = req.body;
        if (!userId)
            return res.status(401).json({ error: "No autorizado" });
        // Todo el proceso de base de datos lo metemos en una sola transacción segura
        await prisma_1.default.$transaction(async (tx) => {
            let finalIds = Array.isArray(victoryTypeIds) ? [...victoryTypeIds] : [];
            // 1. Crear o buscar el Tipo Personalizado (si el usuario mandó texto)
            if (newCustomVictoryName && typeof newCustomVictoryName === 'string') {
                const existing = await tx.victoryTypeCatalog.findFirst({
                    where: { name: newCustomVictoryName, userId: userId }
                });
                let typeId;
                if (existing) {
                    typeId = existing.victoryTypeId;
                }
                else {
                    const newType = await tx.victoryTypeCatalog.create({
                        data: { name: newCustomVictoryName, userId: userId }
                    });
                    typeId = newType.victoryTypeId;
                }
                // Agregamos el ID de esta victoria (nueva o existente) a la lista final
                finalIds.push(typeId);
            }
            // 2. Registrar todas las Victorias (las de catálogo + la personalizada)
            if (finalIds.length > 0) {
                await tx.userVictory.createMany({
                    data: finalIds.map((id) => ({
                        userId: userId,
                        victoryTypeId: Number(id)
                    }))
                });
            }
        });
        // Si la transacción termina sin errores, mandamos el éxito
        return res.status(201).json({ message: "Victorias registradas con éxito" });
    }
    catch (error) {
        // Aquí cae cualquier error y la terminal de VS Code no explota
        console.error("Error registrando victorias:", error);
        return res.status(500).json({ error: "Error registrando victorias" });
    }
};
exports.registerVictories = registerVictories;
//# sourceMappingURL=victory.controller.js.map