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
  getById: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input: { postId }, ctx }) => {
      const currentUserId = ctx.session.user.id;

      const post = await ctx.prisma.post.findFirst({
        where: { id: postId },
        select: {
          id: true,
          content: true,
          createdAt: true,
          comments: true,
          _count: { select: { likes: true, comments: true } },
          likes: { where: { userId: currentUserId } },
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

      if (post == null) return {};

      return {
        id: post.id,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        user: post.user,
        comments: post.comments,
        likeCount: post._count.likes,
        likedByMe: post.likes.length > 0,
      };
    }),
  getPokemonByPost: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input: { postId }, ctx }) => {
      return await ctx.prisma.post.findFirst({
        where: { id: postId },
        select: {
          user: {
            select: {
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
  infiniteHomeFeed: protectedProcedure
    .input(
      z.object({
        where: z.enum(["none", "following"]),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { where, limit = 10, cursor }, ctx }) => {
      return await getInfinitePosts({
        limit,
        ctx,
        cursor,
        whereClause:
          where === "none"
            ? undefined
            : where === "following"
            ? {
                user: {
                  followers: {
                    some: { id: ctx.session?.user.id },
                  },
                },
              }
            : undefined,
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
  toggleLike: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input: { postId }, ctx }) => {
      const data = { postId, userId: ctx.session.user.id };

      const existingLike = await ctx.prisma.like.findUnique({
        where: { userId_postId: data },
      });

      if (existingLike == null) {
        await ctx.prisma.like.create({ data });
        return { addedLike: true };
      } else {
        await ctx.prisma.like.delete({ where: { userId_postId: data } });
        return { addedLike: false };
      }
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
      _count: { select: { likes: true } },
      likes:
        currentUserId == null ? false : { where: { userId: currentUserId } },
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
    posts: data.map((post) => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      user: post.user,
      likeCount: post._count.likes,
      likedByMe: post.likes.length > 0,
    })),
    nextCursor,
  };
}
