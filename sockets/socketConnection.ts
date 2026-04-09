import { Namespace, Socket, Server as SocketIOServer } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import Distributor from "../models/Distributor";
import User from "../models/User";
import dotenv from 'dotenv';
dotenv.config();

export default function socketConnection (
    namespaceName: string,
    io: SocketIOServer, 
    namespace : Namespace, 
    message: string
) {
    namespace = io.of(namespaceName);
    namespace.on("connection", async (socket: Socket) => {
        try {
            const authHeader = socket.handshake.auth.token;
            if (!authHeader?.startsWith("Bearer ")) {
                throw(new Error("Access token required"))
            }
            
            const token = authHeader.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;
            const userId = decoded.id || decoded._id;
            const user = await User.findOne({
                _id: userId,
                status: 'active'
            });

            const distributor = await Distributor.findOne({
                _id: userId,
                status: 'active'
            })

            if(!user && !distributor){
                throw new Error("Unauthorized user");
            }

            socket.join(userId);

            console.log(message, userId);

        } catch (err) {
            console.log("Error", err);
            socket.disconnect();
        }
    });
}