import express from "express";
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize from "./config/db";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000; 

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use(errorHandler);

sequelize.sync()
.then(() => {
    console.log("Database synced");

    app.listen(3000, () => {
        console.log(`Server running on port ${PORT}`);
    });
});