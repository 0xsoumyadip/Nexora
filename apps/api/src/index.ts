import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { createServer } from "node:http";
import { setUpWebSocket } from "@nexora/ws";
import authRoute from "./routes/user.route.ts";
import uploadRoute from "./routes/upload.route.ts";

const app = express();
const port = Number(process.env.PORT ?? 8080);

app.use(express.json());
app.use(cors());
app.use("/", authRoute);
app.use("/", uploadRoute);

const server = createServer(app);

setUpWebSocket(server);

server.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
})
