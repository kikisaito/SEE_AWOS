"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCrisisReflection = exports.updateCrisisProgress = exports.updateCrisisReflection = exports.updateCrisis = exports.startCrisis = void 0;
const prisma_1 = __importDefault(require("../../shared/config/prisma"));
const startCrisis = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { emotionIds, intensity } = req.body;
        if (!userId) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }
        if (!emotionIds || !Array.isArray(emotionIds) || emotionIds.length === 0) {
            return res.status(400).json({
                error: "Debes seleccionar al menos una emoción para iniciar la crisis."
            });
        }
        const newCrisis = await prisma_1.default.crisisSession.create({
            data: {
                userId: userId,
                intensityLevel: intensity || 5,
                startedAt: new Date(),
                selectedEmotions: {
                    connect: emotionIds.map((id) => ({ emotionId: Number(id) }))
                }
            },
            include: {
                selectedEmotions: true
            }
        });
        res.status(201).json({
            message: "Crisis iniciada. Estamos contigo.",
            crisisId: newCrisis.crisisId, // <--- ESTO ES VITAL PARA EL FRONTEND
            session: newCrisis
        });
    }
    catch (error) {
        console.error("Error al iniciar crisis:", error);
        res.status(500).json({ error: "Error interno al iniciar sesión de crisis" });
    }
};
exports.startCrisis = startCrisis;
const updateCrisis = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Datos que nos manda el frontend al terminar
        const { breathingCompleted, finalEvaluationId, notes, triggerDesc, location, companion, substanceUse } = req.body;
        if (!userId) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }
        const existingCrisis = await prisma_1.default.crisisSession.findUnique({
            where: { crisisId: id }
        });
        if (!existingCrisis) {
            return res.status(404).json({ error: "Crisis no encontrada" });
        }
        if (existingCrisis.userId !== userId) {
            return res.status(403).json({ error: "No tienes permiso para editar esta crisis" });
        }
        // 2. Actualizamos la crisis (Cierre)
        const updatedCrisis = await prisma_1.default.crisisSession.update({
            where: { crisisId: id },
            data: {
                breathingExerciseCompleted: breathingCompleted || false,
                finalEvaluationId: finalEvaluationId ? Number(finalEvaluationId) : null,
                notes: notes || null,
                triggerDesc: triggerDesc || null,
                location: location || null,
                companion: companion || null,
                substanceUse: substanceUse || null,
                isReflectionCompleted: true, // ¡Marcamos que ya reflexionó!
                endedAt: new Date() // Guardamos la hora exacta del fin
            },
            include: {
                finalEvaluation: true // Para devolver info bonita
            }
        });
        res.json({
            message: "Crisis finalizada y registrada. Eres fuerte.",
            crisis: updatedCrisis
        });
    }
    catch (error) {
        console.error("Error al finalizar crisis:", error);
        res.status(500).json({ error: "Error interno al actualizar crisis" });
    }
};
exports.updateCrisis = updateCrisis;
const updateCrisisReflection = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { triggerDesc, location, companion, substanceUse, notes } = req.body;
        if (!location || !companion || !substanceUse) {
            return res.status(400).json({ error: "Completa los campos obligatorios (*)" });
        }
        const updated = await prisma_1.default.crisisSession.update({
            where: {
                crisisId: String(id),
                userId
            },
            data: {
                triggerDesc: triggerDesc ? String(triggerDesc) : null,
                location: String(location),
                companion: String(companion),
                substanceUse: String(substanceUse),
                notes: notes ? String(notes) : null,
                isReflectionCompleted: true
            }
        });
        res.json({ message: "Reflexión guardada", data: updated });
    }
    catch (error) {
        console.error("Error reflexión:", error);
        res.status(500).json({ error: "Error al guardar reflexión" });
    }
};
exports.updateCrisisReflection = updateCrisisReflection;
const updateCrisisProgress = async (req, res) => {
    var _a;
    try {
        console.log("=== DEBUG TONY: BODY RECIBIDO EN /progress ===");
        console.log(JSON.stringify(req.body, null, 2));
        console.log("===============================================");
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { id } = req.params;
        // 🚀 Capturamos TODOS los datos que Tony dice estar enviando
        const { breathingExerciseCompleted, usedCapsuleId, finalEvaluationId } = req.body;
        if (!userId)
            return res.status(401).json({ error: "No autorizado" });
        const existingCrisis = await prisma_1.default.crisisSession.findFirst({
            where: { crisisId: String(id), userId: userId }
        });
        if (!existingCrisis) {
            return res.status(404).json({ error: "Crisis no encontrada o no te pertenece" });
        }
        // 🚀 Objeto de datos dinámico a prueba de balas
        const dataToUpdate = {};
        if (breathingExerciseCompleted !== undefined) {
            dataToUpdate.breathingExerciseCompleted = breathingExerciseCompleted;
        }
        if (usedCapsuleId !== undefined) {
            dataToUpdate.usedCapsuleId = usedCapsuleId;
        }
        // Si Tony manda la evaluación por aquí, la atrapamos también
        if (finalEvaluationId !== undefined) {
            dataToUpdate.finalEvaluationId = Number(finalEvaluationId);
        }
        const updatedCrisis = await prisma_1.default.crisisSession.update({
            where: { crisisId: String(id) },
            data: dataToUpdate
        });
        res.status(200).json({ message: "Progreso de crisis actualizado", crisis: updatedCrisis });
    }
    catch (error) {
        console.error("Error al actualizar progreso:", error);
        res.status(500).json({ error: "Error interno al actualizar la crisis" });
    }
};
exports.updateCrisisProgress = updateCrisisProgress;
const saveCrisisReflection = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { id } = req.params;
        const { triggerDesc, location, companion, substanceUse, notes, finalEvaluationId } = req.body;
        if (!userId)
            return res.status(401).json({ error: "No autorizado" });
        // 1. Verificar si la crisis existe y pertenece al usuario
        const existingCrisis = await prisma_1.default.crisisSession.findFirst({
            where: {
                crisisId: String(id),
                userId: userId
            }
        });
        if (!existingCrisis) {
            return res.status(404).json({ error: "Crisis no encontrada o no te pertenece" });
        }
        // 2. Actualizar la crisis marcándola como terminada
        const finishedCrisis = await prisma_1.default.crisisSession.update({
            where: { crisisId: String(id) },
            data: {
                triggerDesc,
                location,
                companion,
                substanceUse,
                notes,
                finalEvaluationId,
                isReflectionCompleted: true, // Se marca como completada
                endedAt: new Date() // Sella la hora exacta en que terminó
            }
        });
        res.status(200).json({ message: "Reflexión guardada y crisis finalizada", crisis: finishedCrisis });
    }
    catch (error) {
        console.error("Error al guardar reflexión:", error);
        res.status(500).json({ error: "Error interno al guardar la reflexión" });
    }
};
exports.saveCrisisReflection = saveCrisisReflection;
//# sourceMappingURL=crisis.controller.js.map