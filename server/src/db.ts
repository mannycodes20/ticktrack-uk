import { PrismaClient } from "@prisma/client";

// One shared database client for the whole server.
export const prisma = new PrismaClient();
