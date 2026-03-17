import express from "express";
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize from "./config/db";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import roleRoutes from "./routes/roleRoutes";
import productRoutes from "./routes/productRoutes";
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000; 

app.use(cors({
  origin: ['http://localhost:8081'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/products', productRoutes);
app.use(errorHandler);

sequelize.sync()
.then(() => {
    console.log("Database synced");

    app.listen(3000, () => {
        console.log(`Server running on port ${PORT}`);
    });
});