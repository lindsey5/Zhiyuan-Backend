import cloudinary from "../config/cloudinaryConfig";
import { deleteFile } from "./cloudinary";
import dotenv from "dotenv";

dotenv.config();

export default async function backupSQLite(dbPath: string, publicId?: string) {
    try {
        if(!publicId) {
            console.error("PUBLIC_ID is not set in environment variables.");
            return;
        }

        await deleteFile(publicId);
        const result = await cloudinary.uploader.upload(dbPath, {
            folder: process.env.CLOUDINARY_DB_FOLDER,
            resource_type: "raw", 
            public_id: publicId,
        });
        console.log(`Backup successful! File uploaded to Cloudinary: ${result.secure_url}`);
        return result.secure_url;
    } catch (err) {
        console.error('Failed to upload SQLite backup:', err);
    }
}