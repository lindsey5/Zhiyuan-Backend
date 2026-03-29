import fs from "fs";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function downloadSQLiteFromCloudinary(publicId?: string, saveAs?: string) {
    try {
        if (!saveAs) {
            console.error("SaveAs filename is not provided. Please set the filename in environment variables.");
            return;
        }

        if (!publicId) {
            console.error("Public ID is not provided. Please set the Public ID in environment variables.");
            return;
        }
        const url = `https://res.cloudinary.com/${process.env.CLOUD_NAME}/raw/upload/${process.env.CLOUDINARY_DB_FOLDER}/${publicId}`;

        const filePath = path.join(process.cwd(), saveAs);

        // Make request as stream
        const response = await axios.get(url, {
            responseType: "stream",
            validateStatus: (status) => status < 500, // Don't throw on 4xx
        });

        // Handle non-2xx responses (e.g. 404)
        if (response.status !== 200) {
            console.warn(`URL returned status ${response.status}. Skipping download.`);
            response.data.destroy(); // Release the stream
            return;
        }

        // Write to file
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise<void>((resolve, reject) => {
            writer.on("finish", () => {
                console.log(`Downloaded SQLite file to: ${filePath}`);
                resolve();
            });
            writer.on("error", (err) => {
                console.error("Download failed:", err);
                reject(err);
            });
        });
    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.warn(`Request failed: ${err.message}. Skipping download.`);
        } else {
            console.error("Unexpected error:", err);
        }
    }
}

(async () => {
    await downloadSQLiteFromCloudinary(process.env.PUBLIC_ID, process.env.SQLITE_DB_SAVE_AS);
})();