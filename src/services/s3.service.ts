import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuración robusta del cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1', 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN || '',
  },
});

export const generateUploadUrl = async (userId: string, fileName: string) => {
  const key = `users/${userId}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: "audio/mpeg",
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return { uploadUrl, key };
  } catch (error) {
    console.error("Error detallado en S3 Service:", error);
    throw error;
  }
};