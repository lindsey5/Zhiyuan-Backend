import express from "express";
import morgan from 'morgan';
import dotenv from 'dotenv';
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
import connectDb from "./config/db";
import distributorRoutes from "./routes/distributorRoutes";
import distributorStockRoutes from "./routes/distributorStockRoutes";
import stockTransferRoutes from "./routes/stockTransferRoutes";
import initializeSocket from "./sockets/socket";
import { createServer } from "http";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; 

const origins = process.env.ORIGINS?.split(",") || ['http://localhost:5173'];

app.use(cors({
    origin: origins,
    methods: ['*'],
    credentials: true,
}));

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
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
app.use(errorHandler);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
}));

connectDb();

const server = createServer(app);

// initialize Socket.IO with the server
initializeSocket(server);

// start listening
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});