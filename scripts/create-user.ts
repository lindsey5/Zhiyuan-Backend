import readline from 'readline';
import Role from '../models/Role';
import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
import dns from "node:dns/promises";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (q: string) =>
  new Promise<string>((resolve) => rl.question(q, resolve));

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("Database connected.");

        const firstname = await question("Enter firstname: ");
        const lastname = await question("Enter lastname: ");
        const email = await question("Enter email: ");
        const password = await question("Enter password: ");

        const existingRoles = await Role.find().lean();
        if (!existingRoles.length) {
        console.log("No roles found. Seed roles first.");
        rl.close();
        return;
        }

        const rolesMap = existingRoles.reduce((acc, role) => {
        acc[role.name] = role._id;
        return acc;
        }, {} as Record<string, mongoose.Types.ObjectId>);

        const roleInput = await question(
        `Select role:\n${Object.keys(rolesMap)
            .map((r) => `- ${r}`)
            .join("\n")}\n> `
        );

        if (!rolesMap[roleInput]) {
            console.log("Invalid role selected.");
            rl.close();
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
        console.log("Email already exists. Try a different one.");
        rl.close();
        return;
        }

        const newUser = await User.create({
            firstname,
            lastname,
            email,
            password,
            role_id: rolesMap[roleInput],
        });

        console.log("User created successfully:");
        console.log(newUser);

    } catch (err: any) {
        console.error(err);
    } finally {
        rl.close();
        await mongoose.disconnect();
    }
})();