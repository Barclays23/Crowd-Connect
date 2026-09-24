// frontend/src/services/socket/socketService.ts
import { io, Socket } from "socket.io-client";



let socket: Socket | null = null;



export const initializeSocket = (token: string) => {
    if (socket) return socket;
    const backendUrl = import.meta.env.VITE_BACKEND_BASE_URL

    socket = io(backendUrl, {
        auth: { token },
        withCredentials: true,
    });

    socket.on("connect", () => {
        console.log("Connected to WebSocket");
    });

    socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket");
    });

    return socket;
};

// export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};