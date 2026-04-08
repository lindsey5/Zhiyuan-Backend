import express from "express";
import morgan from 'morgan';
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
import orderRoutes from "./routes/orderRoutes";
import distributorRoutes from "./routes/distributorRoutes";
import distributorStockRoutes from "./routes/distributorStockRoutes";
import stockTransferRoutes from "./routes/stockTransferRoutes";
import distributorSaleRoutes from "./routes/distributorSaleRoutes";

const app = express();

const origins = process.env.ORIGINS?.split(",") || ['http://localhost:5173'];

app.use(cors({
    origin: origins,
    methods: ['*'],
    credentials: true,
}));

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.set("trust proxy", true);

app.get('/', (_, res) => res.send('Welcome'));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/distributors', distributorRoutes);
app.use('/api/distributor-stocks', distributorStockRoutes);
app.use('/api/stock-transfer-logs', stockTransferRoutes);
app.use('/api/distributor-sales',distributorSaleRoutes);
app.use(errorHandler);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
}));

export default app