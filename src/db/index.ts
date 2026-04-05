import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Make sure it is set in .env.local");
}

const client = postgres(connectionString, {
  prepare: false,
  max: 1,
});

export const db = drizzle(client, { schema });