import app from "./app";
import connectDb from "./config/db";
import initializeSocket from "./sockets/socket";
import { createServer } from "http";
import dotenv from 'dotenv';
import { connectRedis } from "./config/redis";
import dns from "node:dns/promises";
dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const PORT = process.env.PORT || 3000; 
connectDb();
connectRedis();
const server = createServer(app);

// initialize Socket.IO with the server
initializeSocket(server);

// start listening
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});