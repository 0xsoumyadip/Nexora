import { WebSocketServer } from "ws";
import type { Server } from "node:http";

export function setUpWebSocket(server: Server) {
    const wss = new WebSocketServer({
        server,
        path: "/ws"
    });

    wss.on("connection", (socket) => {
        console.log("Websocket connection established.");

        socket.on("message", (message) => {
            console.log(message.toString());
        })

        socket.on("close", () => {
            console.log("Websocket disconnected.")
        })
    });

    return wss;
}