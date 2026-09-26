import { WebSocketServer } from "ws";
import type { Server } from "node:http";
import type { Duplex } from "node:stream";
import { auth } from "@nexora/auth/auth";
import prisma from "@nexora/database";
import { setupWSConnection } from "@y/websocket-server/utils";
import type { WebSocket } from "ws";
import type { IncomingMessage } from "node:http";

function rejectUpgrade(socket: Duplex, status: number, message: string) {
  socket.write(
    `HTTP/1.1 ${status} ${message}\r\n` + "Connection: close\r\n" + "\r\n",
  );
  socket.destroy();
}

export function setUpWebSocket(server: Server) {
  const wss = new WebSocketServer({
    noServer: true,
  });

  server.on("upgrade", (req, socket, head) => {
    void (async () => {
      const url = new URL(req.url ?? "/", "http://localhost");

      if (!url.pathname.startsWith("/ws/")) {
        rejectUpgrade(socket, 404, "Not found");
        return;
      }

      const documentId = decodeURIComponent(url.pathname.slice("/ws/".length));

      if (!documentId || documentId.includes("/")) {
        rejectUpgrade(socket, 400, "Bad Request");
        return;
      }

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value !== undefined) {
          headers.set(key, Array.isArray(value) ? value.join(", ") : value);
        }
      }

      const session = await auth.api.getSession({ headers });

      if (!session) {
        rejectUpgrade(socket, 401, "UNAUTHORIZED!!");
        return;
      }

      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          OR: [
            { authorId: session?.user.id },
            { lastEditedById: session?.user.id },
          ],
        },
        select: { id: true },
      });

      if (!document) {
        rejectUpgrade(socket, 403, "FORBIDDED!!");
        return;
      }

      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req, documentId);
      });
    })().catch((error) => {
      console.error("WebSocket upgrade failed: ", error);
      if (!socket.destroyed) {
        rejectUpgrade(socket, 500, "Internal server error.");
      }
    });
  });

  wss.on(
    "connection",
    (ws: WebSocket, req: IncomingMessage, documentId: string) => {
      setupWSConnection(ws, req, { docName: documentId });
    },
  );

  wss.on("error", (error) => {
    console.error("WebSocket server error: ", error);
  });

  return wss;
}
