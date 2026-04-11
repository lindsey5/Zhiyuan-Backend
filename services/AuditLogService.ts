import { deleteCache } from "../config/redis";
import AuditLog from "../models/AuditLog";

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface CreateAuditLogParams {
    ip_address: string;
    user_agent: string;

    user_id: number;
    role: string;

    action: string;
    description: string;

    severity: Severity;

    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
}

class AuditLogService {
    static async log (data: CreateAuditLogParams) {
        try{
            await AuditLog.create({
                ...data,
                new_values: data.new_values,
                old_values: data.old_values
            });
            await deleteCache("auditLogs:*")
        }catch(err){
            console.log("AuditLogService Error:", err);
        }
    }
}

export default AuditLogService