import { Namespace, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import Distributor from "../models/Distributor";
import User from "../models/User";
import dotenv from 'dotenv';
dotenv.config();

type SocketEvents = {
    [eventName: string]: (data?: any) => void | Promise<void>;
};

export default function socketConnection({
    namespace,
    message,
    events,
    authenticate = true
}: {
    namespace: Namespace,
    message: string,
    events?: SocketEvents,
    authenticate?: boolean
}) {
    namespace.on("connection", async (socket: Socket) => {
        try {
            if(authenticate){
                const authHeader = socket.handshake.auth.token;
                if (!authHeader?.startsWith("Bearer ")) {
                    throw new Error("Access token required");
                }

                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;
                const userId = decoded.id || decoded._id;

                const user = await User.findOne({ _id: userId, status: "active" });
                const distributor = await Distributor.findOne({ _id: userId, status: "active" });

                if (!user && !distributor) {
                    throw new Error("Unauthorized user");
                }

                socket.join(userId);
                console.log(message, userId);
            }

            // Register custom events dynamically
            if (events) {
                for (const [eventName, callback] of Object.entries(events)) {
                    socket.on(eventName, callback);
                }
            }
        } catch (err : any) {
            console.log("Socket connection error:", err);
            socket.emit("auth_error", {
                message: err.message
            });
            socket.disconnect();
        }
    });
}