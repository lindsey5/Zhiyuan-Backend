import readline from 'readline';
import sequelize from '../config/db';
import { Role, User } from '../database/models/index';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (q: string) =>
    new Promise<string>((resolve) => rl.question(q, resolve));

(async () => {
    try {
        await sequelize.sync();
        console.log("Database synced.");

        const firstname = await question("Enter firstname: ");
        const lastname = await question("Enter lastname: ");
        const email = await question("Enter email: ");
        const password = await question("Enter password: ");

        const existingRoles = await Role.findAll();
        if (!existingRoles.length) {
            console.log("No roles found. Seed roles first.");
            rl.close();
            return;
        }

        const rolesMap = existingRoles.reduce((acc, role) => {
            const r = role.toJSON();
            acc[r.name] = r.id;
            return acc;
        }, {} as Record<string, number>);

        const roleInput = await question(`Select role:\n${Object.keys(rolesMap).map((r) => `- ${r}`).join("\n")}\n> `);

        if (!rolesMap[roleInput]) {
            console.log("Invalid role selected.");
            rl.close();
            return;
        }

        const existingUser = await User.findOne({ where: { email } });
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
        console.log(newUser.toJSON());

    } catch (err: any) {
        console.error(err);
    } finally {
        rl.close();
    }
})();