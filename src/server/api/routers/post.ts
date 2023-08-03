import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getStaticData: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input: { postId }, ctx }) => {
      const post = await ctx.prisma.post.findFirst({
        where: { id: postId },
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

      if (post == null) return {};

      return {
        id: post.id,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        user: post.user,
      };
    }),
  getDynamicData: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input: { postId }, ctx }) => {
      const currentUserId = ctx.session.user.id;

      const post = await ctx.prisma.post.findFirst({
        where: { id: postId },
        select: {
          comments: {
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
            orderBy: {
              createdAt: "desc",
            },
          },
          _count: { select: { likes: true, comments: true } },
          likes: { where: { userId: currentUserId } },
        },
      });

      if (post == null) return {};

      return {
        comments: post.comments,
        commentCount: post._count.comments,
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
