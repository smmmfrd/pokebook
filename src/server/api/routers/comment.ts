import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  createTRPCContext,
} from "~/server/api/trpc";

export const commentRouter = createTRPCRouter({
  createNew: protectedProcedure
    .input(z.object({ content: z.string(), postId: z.string() }))
    .mutation(async ({ input: { content, postId }, ctx }) => {
      const newComment = await ctx.prisma.comment.create({
        data: {
          content,
          postId,
          userId: ctx.session.user.id,
        },
      });

      return { newComment };
    }),
});
