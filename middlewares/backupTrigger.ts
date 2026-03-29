import { NextFunction, Request, Response } from "express";
import backupSQLite from "../utils/backup";
import dotenv from "dotenv";

dotenv.config();

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
            backupSQLite(dbPath, process.env.PUBLIC_ID).catch((err) => {
                console.error("[Backup Trigger] Failed to backup SQLite:", err);
            });
        }

        next();
    };
}