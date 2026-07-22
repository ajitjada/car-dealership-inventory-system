import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  mimetype: string
): Promise<{ url: string; publicId: string }> => {
  const isCloudinaryConfigured =
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET);

  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "car-dealership-vehicles" },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary image upload failed"));
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      uploadStream.end(fileBuffer);
    });
  } else {
    // Graceful fallback for local dev / testing without Cloudinary credentials
    const base64 = fileBuffer.toString("base64");
    const dataUrl = `data:${mimetype};base64,${base64}`;
    const mockPublicId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return { url: dataUrl, publicId: mockPublicId };
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (publicId && !publicId.startsWith("local_") && process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error("Cloudinary delete error:", err);
    }
  }
};
