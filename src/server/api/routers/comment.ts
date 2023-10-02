import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const commentRouter = createTRPCRouter({
  createNew: publicProcedure
    .input(
      z.object({
        content: z.string(),
        postId: z.string(),
        userPokemonId: z.number(),
      })
    )
    .mutation(async ({ input: { content, postId, userPokemonId }, ctx }) => {
      const newComment = await ctx.prisma.comment.create({
        data: {
          content,
          postId,
          posterId: userPokemonId,
        },
      });

      return { newComment };
    }),
});
