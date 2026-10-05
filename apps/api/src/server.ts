import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { setUpWebSocket } from "@nexora/ws";
import authRoute from "./routes/user.route.ts";
import { authHandler } from "@nexora/auth";
import googleDriveRoute from "./routes/google-drive.route.ts";
import documentRoute from "./routes/document.route.ts";

const app = express();
const port = Number(process.env.PORT ?? 8080);
const allowedOrigins = new Set([
  process.env.WEB_URL ?? "http://localhost:3000",
  ...(process.env.NODE_ENV === "production"
    ? []
    : ["http://localhost:3000", "http://127.0.0.1:3000"]),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true,
  }),
);

app.all("/api/auth/*splat", authHandler);
app.use(express.json());
app.use("/", authRoute);
app.use("/api/google-drive", googleDriveRoute);
app.use("/api/document", documentRoute);

const server = createServer(app);

setUpWebSocket(server);

server.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
