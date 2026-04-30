import ROLES from "../utils/roles";
import mongoose from "mongoose";
import Role from "../models/Role";
import Permission from "../models/Permission";
import dotenv from 'dotenv';
import dns from "node:dns/promises";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const setupRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("Database connected.");

        for (const [, roleData] of Object.entries(ROLES)) {
            const existingRole = await Role.findOne({ name: roleData.name });

            if (existingRole) {
                // Update description
                await Role.updateOne(
                    { _id: existingRole._id },
                    { description: roleData.description }
                );

                // Ensure all permissions exist
                for (const permission of roleData.permissions) {
                    const existingPermission = await Permission.findOne({
                        role_id: existingRole._id,
                        action: permission,
                    });

                    if (!existingPermission) {
                        await Permission.create({
                            action: permission,
                            role_id: existingRole._id,
                        });
                    }
                }

                console.log(`Role "${roleData.name}" updated`);
            } else {
                const { permissions, ...rest } = roleData;

                const role = await Role.create(rest);


                const permissionData = permissions.map((action: string) => ({
                    action,
                    role_id: role._id,
                }));

                await Permission.insertMany(permissionData);

                console.log(`Role "${role.name}" created with permissions`);
            }
        }
    } catch (err: any) {
        console.error("Error setting up roles:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
    }
};

setupRoles();