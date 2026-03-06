"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPresignedUrl = void 0;
const s3_service_1 = require("../../shared/s3.service");
const getPresignedUrl = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { filename } = req.query;
        if (!userId) {
            return res.status(401).json({ error: "No autorizado" });
        }
        if (!filename || typeof filename !== 'string') {
            return res.status(400).json({ error: "El parámetro 'filename' es obligatorio" });
        }
        let fileType = 'application/octet-stream';
        if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg'))
            fileType = 'image/jpeg';
        else if (filename.toLowerCase().endsWith('.png'))
            fileType = 'image/png';
        else if (filename.toLowerCase().endsWith('.m4a') || filename.toLowerCase().endsWith('.mp3'))
            fileType = 'audio/mpeg';
        const result = await (0, s3_service_1.generateUploadUrl)(userId, filename, fileType);
        res.json(result);
    }
    catch (error) {
        console.error("Error en el controlador de S3:", error);
        res.status(500).json({ error: "No se pudo generar la URL de carga temporal" });
    }
};
exports.getPresignedUrl = getPresignedUrl;
//# sourceMappingURL=s3.controller.js.map