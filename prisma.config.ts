import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in .env");
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL, // Prisma v7 expects only 'url' here
  },
});
