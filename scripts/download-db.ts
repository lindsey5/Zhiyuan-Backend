import fs from "fs";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function downloadSQLite(url?: string, saveAs?: string) {
    return new Promise<void>((resolve, reject) => {
        try {
            if(!saveAs) {
                console.error("SaveAs filename is not provided. Please set the filename in environment variables.");
                return;
            }

            if(!url) {
                console.error("URL is not provided. Please set the URL in environment variables.");
                return;
            }
            const filePath = path.join(process.cwd(), saveAs);
            
            // Make request as stream
            axios.get(url, { responseType: "stream" }).then((response) => {
                // Write to file
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                writer.on("finish", () => {
                    console.log(`Downloaded SQLite file to: ${filePath}`);
                    resolve();
                });
                writer.on("error", (err) => {
                    console.error("Download failed:", err);
                    reject(err);
                });
            }).catch((err) => {
                reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });
}

(async () => {
    await downloadSQLite(process.env.SQLITE_DB_URL, process.env.SQLITE_DB_SAVE_AS);
})();