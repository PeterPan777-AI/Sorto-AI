import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Detect database type from connection string
const isSQLite = connectionString.startsWith('file:') || connectionString.endsWith('.db');

export default defineConfig({
  schema: "./drizzle/schema.sqlite.ts",
  out: "./drizzle",
  dialect: isSQLite ? "sqlite" : "mysql",
  dbCredentials: isSQLite 
    ? { url: connectionString.replace('file:', '') }
    : { url: connectionString },
});
