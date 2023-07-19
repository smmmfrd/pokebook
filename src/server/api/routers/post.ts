import { Prisma } from "@prisma/client";
import { inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  createTRPCContext,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  infiniteHomeFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 10, cursor }, ctx }) => {
      return await getInfinitePosts({
        limit,
        ctx,
        cursor,
        whereClause: undefined,
      });
    }),
  infiniteProfileFeed: publicProcedure
    .input(
      z.object({
        profileId: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { profileId, limit = 10, cursor }, ctx }) => {
      return await getInfinitePosts({
        limit,
        ctx,
        cursor,
        whereClause: { userId: profileId },
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

async function getInfinitePosts({
  ctx,
  limit,
  cursor,
  whereClause,
}: {
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
  limit: number;
  cursor: { id: string; createdAt: Date } | undefined;
  whereClause?: Prisma.PostWhereInput;
}) {
  const currentUserId = ctx.session?.user.id;

  const data = await ctx.prisma.post.findMany({
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
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

  // Setting up the cursor for the next query to this
  let nextCursor: typeof cursor | undefined;
  if (data.length > limit) {
    // Since we pass in limit + 1, if the length is > limit, there's more to get.
    const nextItem = data.pop();
    if (nextItem != null) {
      nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
    }
  }

  return {
    posts: data,
    nextCursor,
  };
}
