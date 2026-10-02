import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { setUpWebSocket } from "@nexora/ws";
import authRoute from "./routes/user.route.ts";
import { authHandler } from "@nexora/auth";

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

const server = createServer(app);

setUpWebSocket(server);

server.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
