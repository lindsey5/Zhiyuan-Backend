import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import backupSQLiteDebounced from "../utils/backup";
import fs from 'fs';

dotenv.config();

let lastModified : any = null;

const hasFileChanged = (filePath : string) => {
    const stats = fs.statSync(filePath);
    const currentModified = stats.mtimeMs;

    if (lastModified === null) {
        lastModified = currentModified;
        return false;
    }

    if (currentModified !== lastModified) {
        lastModified = currentModified;
        return true;
    }

    return false;
};


export default function backupOnWrite(dbPath: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (process.env.ENABLE_WATCHER !== "true") {
            console.log("SQLite watcher is disabled. Set ENABLE_WATCHER=true in .env to enable it.");
            return next();
        }

        const writeMethods = ["POST", "PUT", "DELETE", "PATCH"];
        if (writeMethods.includes(req.method)) {
            console.log(`[Backup Trigger] ${req.method} request detected on ${req.originalUrl}`);

            // Run backup in the background without blocking the request
            backupSQLiteDebounced(dbPath, process.env.PUBLIC_ID).catch((err) => {
                console.error("[Backup Trigger] Failed to backup SQLite:", err);
            });
        }

        next();
    };
}