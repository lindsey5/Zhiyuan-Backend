import Role from '../models/Role';
import User from '../models/User';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

(async () => {
  try {
        // Connect to MongoDB
        console.log(process.env.MONGO_URI)
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("Database connected.");

        // Get user info from environment variables
        const firstname = process.env.FIRSTNAME;
        const lastname = process.env.LASTNAME;
        const email = process.env.EMAIL;
        const password = process.env.PASSWORD;

        if (!firstname || !lastname || !email || !password) {
            throw new Error("Missing environment variables: FIRSTNAME, LASTNAME, EMAIL, or PASSWORD");
        }

        // Get the first role in the database (sorted by creation time)
        const role = await Role.findOne().sort({ _id: 1 }).lean();

        if (!role) {
            throw new Error("No roles found in the database. Please create a role first.");
        }

        const existingEmail = await User.findOne({ email });

        if(existingEmail) throw new Error("Email already exists.");

        // Create the new user
        const newUser = await User.create({
            firstname,
            lastname,
            email,
            password,
            role_id: role._id,
        });

        console.log("New user created:", newUser);
    } catch (err: any) {
        console.error("Error creating user:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
    }
})();