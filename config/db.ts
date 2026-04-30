import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  dotenv.config();
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "");
    console.log(`Connected to MongoDB`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

export default connectDB;