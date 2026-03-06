"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvaluations = exports.getEmotions = void 0;
const prisma_1 = __importDefault(require("../../shared/config/prisma"));
const getEmotions = async (req, res) => {
    try {
        const emotions = await prisma_1.default.emotionCatalog.findMany();
        res.json(emotions);
    }
    catch (error) {
        console.error("Error al obtener emociones:", error);
        res.status(500).json({ error: 'Error interno al obtener emociones' });
    }
};
exports.getEmotions = getEmotions;
const getEvaluations = async (req, res) => {
    try {
        const evaluations = await prisma_1.default.evaluationScaleCatalog.findMany();
        res.json(evaluations);
    }
    catch (error) {
        console.error("Error al obtener evaluaciones:", error);
        res.status(500).json({ error: 'Error interno al obtener evaluaciones' });
    }
};
exports.getEvaluations = getEvaluations;
//# sourceMappingURL=catalog.controller.js.map