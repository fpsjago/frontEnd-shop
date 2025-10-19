import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const S3_CONFIG = {
  region: import.meta.env.PUBLIC_AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: import.meta.env.PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: import.meta.env.PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
};

const BUCKET_NAME = import.meta.env.PUBLIC_S3_BUCKET || "rifasimagenes";

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client(S3_CONFIG);
  }
  return s3Client;
}

export interface UploadToS3Options {
  file: File;
  folder?: string;
}

export interface UploadToS3Result {
  url: string;
  key: string;
}

export async function uploadImageToS3(options: UploadToS3Options): Promise<UploadToS3Result> {
  const { file, folder } = options;

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = folder ? `${folder}/${timestamp}-${sanitizedFileName}` : `${timestamp}-${sanitizedFileName}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    const client = getS3Client();
    await client.send(command);

    const url = `https://${BUCKET_NAME}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;

    return { url, key };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload image to S3");
  }
}

export async function deleteImageFromS3(imageUrl: string): Promise<void> {
  if (!imageUrl) {
    console.log("No image URL provided for deletion");
    return;
  }

  console.log("Starting S3 deletion for URL:", imageUrl);

  try {
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1);

    console.log("Extracted S3 key:", key);
    console.log("Target bucket:", BUCKET_NAME);

    if (!key) {
      console.warn("Could not extract S3 key from URL:", imageUrl);
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    console.log("Sending delete command to S3...");
    const client = getS3Client();
    const response = await client.send(command);

    console.log("S3 Delete Response:", response);
    console.log("Successfully deleted image from S3:", key);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw new Error(`Failed to delete image from S3: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export function extractS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}
