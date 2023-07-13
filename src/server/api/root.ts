import { PrismaClient } from "@prisma/client";
import { createTRPCRouter } from "~/server/api/trpc";
import { pokemonRouter } from "./routers/pokemon";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  pokemon: pokemonRouter,
});

// server side tRPC
const prisma = new PrismaClient();
export const caller = appRouter.createCaller({ prisma, session: null });

// export type definition of API
export type AppRouter = typeof appRouter;
