import cloudinary from "../config/cloudinaryConfig";
import { deleteFiles } from "./cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Debounce timeout holder
let backupTimeout: NodeJS.Timeout | null = null;

export default function backupSQLiteDebounced(dbPath: string, publicId?: string, delay = 2000) {
    return new Promise<string | void>((resolve, reject) => {
        if (backupTimeout) clearTimeout(backupTimeout);

        backupTimeout = setTimeout(async () => {
            try {
                if (!publicId) {
                    console.error("PUBLIC_ID is not set in environment variables. Backup skipped.");
                    return resolve();
                }

                console.log(`Starting backup for SQLite file: ${dbPath}`);

                const result = await cloudinary.uploader.upload(dbPath, {
                    folder: process.env.CLOUDINARY_DB_FOLDER,
                    resource_type: "raw",
                    public_id: publicId,
                    overwrite: true,
                    invalidate: true,
                    type: "private",
                });
                console.log(`Backup successful! File uploaded to Cloudinary: ${result.secure_url}`);
                resolve(result.secure_url);
            } catch (err) {
                console.error("Failed to upload SQLite backup:", err);
                reject(err);
            }
        }, delay); 
    });
}