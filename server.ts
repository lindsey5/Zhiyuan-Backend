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
import auditRoutes from "./routes/auditRoutes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import categoryRoutes from "./routes/categoryRoutes";
import variantRoutes from "./routes/variantRoutes";
import path from "path";
import { watchSQLite } from "./utils/watchDB";

dotenv.config();
const DB_PATH = path.join(__dirname, process.env.SQLITE_PATH || 'database.sqlite');
watchSQLite(DB_PATH);

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:5173', 'https://zhiyuan-frontend.vercel.app'],
  methods: ['*'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.set("trust proxy", true);

app.get('/', (_, res) => res.json('Welcome'));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/categories', categoryRoutes);
app.use(errorHandler);

app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
        defaultModelsExpandDepth: -1,
        },
    })
);

sequelize.sync()
.then(() => {
    console.log("Database synced");

    app.listen(3000, () => {
        console.log(`Server running on port ${PORT}`);
    });
});