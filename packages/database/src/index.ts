import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

// Load the database package's .env regardless of the process working directory.
const { parsed } = config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
});

const connectionString = process.env.DATABASE_URL || parsed?.DATABASE_URL;
if (!connectionString) {
  throw new Error("Database url not found!");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
