import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getHomeFeed: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.post.findMany({
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            profileImage: true,
            pokemon: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }),
  createPost: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      const post = await ctx.prisma.post.create({
        data: { userId: ctx.session.user.id, content },
      });

      return post;
    }),
});
