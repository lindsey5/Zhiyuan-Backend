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
import orderRoutes from "./routes/orderRoutes";
import backupOnWrite from "./middlewares/backupTrigger";
import distributorRoutes from "./routes/distributorRoutes";

dotenv.config();
const DB_PATH = path.resolve(
  __dirname,
  process.env.NODE_ENV !== "development"
    ? process.env.PRODUCTION_SQLITE_PATH || "./database.sqlite"
    : process.env.SQLITE_PATH || "./database.sqlite"
);

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:5173', 'https://zhiyuan-frontend.vercel.app'],
  methods: ['*'],
  credentials: true,
}));

app.use(backupOnWrite(DB_PATH));
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json({ limit: "1gb" }));
app.use(express.urlencoded({ limit: "1gb", extended: true }));
app.set("trust proxy", true);

app.get('/', (_, res) => res.json('Welcome'));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/distributors', distributorRoutes);
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