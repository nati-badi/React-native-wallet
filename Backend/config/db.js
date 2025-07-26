import { neon } from "@neondatabase/serverless";

import "dotenv/config";

// Creates a SQL connection using the DATABASE_URL environment variable
export const sql = neon(process.env.DATABASE_URL);
