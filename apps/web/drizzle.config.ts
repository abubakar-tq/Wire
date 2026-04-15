import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const connectionString =
  process.env.DIRECT_URL ??
  process.env.PLAYER_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("PLAYER_DATABASE_URL or DATABASE_URL must be set in apps/web/.env for drizzle-kit");
}

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString
  },
  schemaFilter: ["app"]
});
