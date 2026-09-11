// backend/src/services/socket-services/implementations/socket.service.ts
import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { ISocketService } from "../interfaces/ISocketService";
import { verifyAccessToken } from "@/utils/jwt.utils";





export class SocketService implements ISocketService {
    private _io: SocketIOServer | null = null;

    initialize(server: HttpServer): void {
        this._io = new SocketIOServer(server, {
            cors: {
                origin: process.env.FRONTEND_URL,
                methods: ["GET", "POST"],
                credentials: true,
            },
        });

        // Middleware to authenticate socket connections
        this._io.use((socket: Socket, next) => {
            try {
                // Expecting the token from frontend: { auth: { token: "..." } }
                const token = socket.handshake.auth.token;
                
                if (!token) {
                    return next(new Error("Authentication error: Token missing"));
                }

                const decoded = verifyAccessToken(token); 
                
                // Attach userId to the socket object for later use
                socket.data.userId = decoded.userId; 
                next();

            } catch (error) {
                next(new Error("Authentication error: Invalid token"));
            }
        });

        // Connection Handler
        this._io.on("connection", (socket: Socket) => {
            const userId = socket.data.userId;
            
            // Join a room specific to this user so we can target them easily
            socket.join(userId);
            console.log(`[Socket] User connected and joined room: ${userId}`);

            socket.on("disconnect", () => {
                console.log(`[Socket] User disconnected: ${userId}`);
            });
        });
    }



    emitToUser(userId: string, event: string, data: unknown): void {
        if (!this._io) {
            console.warn("[SocketService] Cannot emit, Socket.IO is not initialized.");
            return;
        }
        
        // Emits only to the room named after the userId
        this._io.to(userId).emit(event, data);
    }
}