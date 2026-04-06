import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Make sure it is set in .env.local");
}

type DbClient = ReturnType<typeof postgres>;
type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  // eslint-disable-next-line no-var
  var __dbClient: DbClient | undefined;
  // eslint-disable-next-line no-var
  var __drizzleDb: DrizzleDb | undefined;
}

const client =
  globalThis.__dbClient ??
  postgres(connectionString, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

const db = globalThis.__drizzleDb ?? drizzle(client, { schema });

if (process.env.NODE_ENV !== "production") {
  globalThis.__dbClient = client;
  globalThis.__drizzleDb = db;
}

export { db };
