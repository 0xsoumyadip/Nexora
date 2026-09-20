import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 8080);

app.use(express.json());

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
})