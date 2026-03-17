import sequelize from "../config/db";
import { Role, User } from '../models/index';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
    try {
        await sequelize.sync();
        console.log("Database synced.");

        // Get user info from environment variables
        const firstname = process.env.FIRSTNAME;
        const lastname = process.env.LASTNAME;
        const email = process.env.EMAIL;
        const password = process.env.PASSWORD;

        if (!firstname || !lastname || !email || !password) {
            throw new Error("Missing environment variables: FIRSTNAME, LASTNAME, EMAIL, or PASSWORD");
        }

        // Get the first role in the database
        const role = await Role.findOne({
            order: [['id', 'ASC']]
        });

        if (!role) {
            throw new Error("No roles found in the database. Please create a role first.");
        }

        // Create the new user
        const newUser = await User.create({
            firstname,
            lastname,
            email,
            password,
            role_id: role.toJSON().id,
        });

        console.log("New user created:", newUser.toJSON());
    } catch (err: any) {
        console.error("Error creating user:", err.message);
    } finally {
        await sequelize.close();
        console.log("Database connection closed.");
    }
})();