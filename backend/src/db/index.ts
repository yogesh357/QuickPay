import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";
import * as schema from "./schema.js";

dotenv.config();

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:%40252302Yogesh@127.0.0.1:5432/quickpay_db";

export const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
