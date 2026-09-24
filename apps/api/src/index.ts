import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { createServer } from "node:http";
import authRoute from "./routes/user.route.ts";

const app = express();
const port = Number(process.env.PORT ?? 8080);

app.use(express.json());
app.use(authRoute);

const server = createServer(app);

server.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
})