import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { relations } from "./relations.js"

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const db: NodePgDatabase<typeof relations> = drizzle(process.env.DATABASE_URL!, { relations });

export default db;
