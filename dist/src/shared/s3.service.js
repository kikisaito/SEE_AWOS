"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDownloadUrl = exports.deleteFileFromS3 = exports.generateUploadUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client_s3_2 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_s3_3 = require("@aws-sdk/client-s3");
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_BUCKET_NAME) {
    console.warn(" ADVERTENCIA: Credenciales de AWS no configuradas completamente.");
}
const s3Client = new client_s3_2.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        sessionToken: process.env.AWS_SESSION_TOKEN || '',
    },
});
const generateUploadUrl = async (userId, fileName, fileType) => {
    const cleanFileName = fileName.replace(/\s+/g, '-');
    const key = `users/${userId}/${Date.now()}-${cleanFileName}`;
    const command = new client_s3_2.PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: fileType,
    });
    try {
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, {
            expiresIn: 300,
            signableHeaders: new Set(['x-amz-acl'])
        });
        return { uploadUrl, key };
    }
    catch (error) {
        console.error("Error detallado en S3 Service:", error);
        throw new Error("No se pudo generar la URL de carga.");
    }
};
exports.generateUploadUrl = generateUploadUrl;
const deleteFileFromS3 = async (s3Key) => {
    try {
        const command = new client_s3_3.DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
        });
        await s3Client.send(command);
        console.log(` Archivo eliminado de S3: ${s3Key}`);
    }
    catch (error) {
        console.error(" Error al borrar archivo de S3:", error);
        throw new Error("No se pudo eliminar el archivo físico de la nube");
    }
};
exports.deleteFileFromS3 = deleteFileFromS3;
const getDownloadUrl = async (s3Key) => {
    try {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
        });
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
        return signedUrl;
    }
    catch (error) {
        console.error("❌ Error al generar URL de lectura de S3:", error);
        throw new Error("No se pudo generar el enlace de audio");
    }
};
exports.getDownloadUrl = getDownloadUrl;
//# sourceMappingURL=s3.service.js.map