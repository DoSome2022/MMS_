import { defineConfig, env } from "prisma/config";
import dotenv from "dotenv";

dotenv.config(); // 加载 .env 文件

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});
