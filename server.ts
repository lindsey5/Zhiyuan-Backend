import app from "./app";
import connectDb from "./config/db";
import initializeSocket from "./sockets/socket";
import { createServer } from "http";
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000; 
connectDb();

const server = createServer(app);

// initialize Socket.IO with the server
initializeSocket(server);

// start listening
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});