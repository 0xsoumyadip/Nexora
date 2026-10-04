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

app.use(
  cors({
    origin: process.env.WEB_URL ?? "http://localhost:3000",
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
