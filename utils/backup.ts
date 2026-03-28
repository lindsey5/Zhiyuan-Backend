import cloudinary from "../config/cloudinaryConfig";
import { deleteFile } from "./cloudinary";

export default async function backupSQLite(dbPath: string, publicId?: string) {
    try {
        if(!publicId) {
            console.error("PUBLIC_ID is not set in environment variables.");
            return;
        }

        await deleteFile(publicId);
        const result = await cloudinary.uploader.upload(dbPath, {
            folder: "sqlite_backups",
            resource_type: "raw", 
            public_id: publicId,
        });
        return result.secure_url;
    } catch (err) {
        console.error('Failed to upload SQLite backup:', err);
    }
}