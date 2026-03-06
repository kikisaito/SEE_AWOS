"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.updateProfile = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("../../shared/config/prisma"));
const s3_service_1 = require("../../shared/s3.service");
// GET /api/users/profile (Para que el frontend cargue los datos)
const getProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ error: "No autorizado" });
        const user = await prisma_1.default.user.findUnique({
            where: { userId },
            select: {
                email: true,
                preferredName: true,
                avatarKey: true,
                createdAt: true
            }
        });
        if (!user)
            return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(user);
    }
    catch (error) {
        console.error("Error obteniendo perfil:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
exports.getProfile = getProfile;
// PUT /api/users/profile (Actualizar nombre y/o foto)
const updateProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { preferredName, avatarKey } = req.body;
        if (!userId)
            return res.status(401).json({ error: "No autorizado" });
        // 1. Buscamos al usuario actual para ver si ya tiene una foto
        const currentUser = await prisma_1.default.user.findUnique({
            where: { userId },
            select: { avatarKey: true }
        });
        // 2. Limpieza de S3: Si tiene foto vieja, y Tony mandó borrarla ("") o cambiarla por una nueva, eliminamos la anterior
        if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.avatarKey) && currentUser.avatarKey !== avatarKey) {
            try {
                await (0, s3_service_1.deleteFileFromS3)(currentUser.avatarKey);
            }
            catch (s3Error) {
                console.warn("Aviso: No se pudo borrar la foto antigua de S3, continuando...", s3Error);
            }
        }
        // 3. Construimos el objeto de actualización a prueba de balas
        const dataToUpdate = {};
        if (preferredName !== undefined)
            dataToUpdate.preferredName = preferredName;
        // Si Tony manda "" o null, limpiamos la base de datos
        if (avatarKey === "" || avatarKey === null) {
            dataToUpdate.avatarKey = null;
        }
        else if (avatarKey !== undefined) {
            dataToUpdate.avatarKey = avatarKey;
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { userId },
            data: dataToUpdate,
            select: { preferredName: true, avatarKey: true }
        });
        res.json({ message: "Perfil actualizado con éxito", user: updatedUser });
    }
    catch (error) {
        console.error("Error actualizando perfil:", error);
        res.status(500).json({ error: "No se pudo actualizar el perfil" });
    }
};
exports.updateProfile = updateProfile;
// DELETE /api/users/profile (Borrar cuenta - GDPR)
const deleteAccount = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ error: "No autorizado" });
        // "onDelete: Cascade" 
        // borrar al usuario eliminará automáticamente TODAS sus crisis, victorias y cápsulas.
        await prisma_1.default.user.delete({
            where: { userId }
        });
        res.json({ message: "Cuenta y datos eliminados correctamente. Lamentamos verte partir." });
    }
    catch (error) {
        console.error("Error eliminando cuenta:", error);
        res.status(500).json({ error: "No se pudo eliminar la cuenta" });
    }
};
exports.deleteAccount = deleteAccount;
//# sourceMappingURL=user.controller.js.map