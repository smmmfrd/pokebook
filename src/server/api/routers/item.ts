import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const itemRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.item.findMany();
    return items;
  }),
});
