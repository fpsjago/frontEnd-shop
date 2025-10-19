import { uploadImageToS3, deleteImageFromS3, type UploadToS3Result } from "../utils/s3Upload";

export interface ImageUploadOptions {
  file: File;
  folder?: string;
  onProgress?: (progress: number) => void;
}

export interface ImageUploadResult {
  imageUrl: string;
  thumbnailUrl: string;
  s3Key: string;
}

export const imageUploadService = {
  async uploadProductImage(options: ImageUploadOptions): Promise<ImageUploadResult> {
    const { file, folder, onProgress } = options;

    try {
      if (onProgress) onProgress(0);

      const result: UploadToS3Result = await uploadImageToS3({ file, folder });

      if (onProgress) onProgress(100);

      return {
        imageUrl: result.url,
        thumbnailUrl: result.url,
        s3Key: result.key,
      };
    } catch (error) {
      console.error("Error uploading product image:", error);
      throw error;
    }
  },

  async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      if (!imageUrl) {
        console.log("No image URL provided for deletion");
        return;
      }

      console.log("Checking if URL is S3 image:", imageUrl);
      const isS3Image = imageUrl.includes("s3.amazonaws.com") || imageUrl.includes(import.meta.env.PUBLIC_S3_BUCKET || "rifasimagenes");

      console.log("Is S3 image?", isS3Image);

      if (isS3Image) {
        console.log("Attempting to delete from S3...");
        await deleteImageFromS3(imageUrl);
        console.log("S3 deletion completed successfully");
      } else {
        console.log("Image is not from S3, skipping deletion");
      }
    } catch (error) {
      console.error("Error deleting product image:", error);
      throw error;
    }
  },

  createPreviewUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error("Failed to create preview URL"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(file);
    });
  },

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.",
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size exceeds 5MB limit.",
      };
    }

    return { valid: true };
  },
};
