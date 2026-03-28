import chokidar from "chokidar";
import backupSQLite from "./backup";
import dotenv from "dotenv";

dotenv.config();

export function watchSQLite(dbPath: string) {
    if(process.env.ENABLE_WATCHER !== "true") {
        console.log("SQLite watcher is disabled. Set ENABLE_WATCHER=true in .env to enable it.");
        return;
    }

    // Debounce to avoid multiple triggers per write
    let backupTimeout: NodeJS.Timeout | null = null;

    const watcher = chokidar.watch(dbPath, {
        persistent: true,
        usePolling: true, 
        interval: 1000,  
    });

    watcher.on("change", (filePath) => {
        console.log(`Change detected in ${filePath}`);
        if (backupTimeout) clearTimeout(backupTimeout);
            backupTimeout = setTimeout(async () => {
            console.log(`Backing up ${filePath}...`);
            await backupSQLite(filePath, process.env.PUBLIC_ID);
        }, 2000); 
    });

    console.log(`Watching SQLite file for changes: ${dbPath}`);
}