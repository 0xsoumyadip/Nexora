import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import multer from "multer";
import type { ErrorRequestHandler } from "express";
import { createServer } from "node:http";
import { setUpWebSocket } from "@nexora/ws";
import authRoute from "./routes/user.route.ts";
import uploadRoute from "./routes/upload.route.ts";

const app = express();
const port = Number(process.env.PORT ?? 8080);

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/", authRoute);
app.use("/", uploadRoute);

const handleApiError: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({
      status: false,
      message: "File is too large. Maximum file size is 10 MB.",
    });
    return;
  }

  console.error("Unhandled API error:", error);
  res.status(500).json({ status: false, message: "Internal server error." });
};

app.use(handleApiError);

const server = createServer(app);

setUpWebSocket(server);

server.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
})
