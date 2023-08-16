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
          poster: {
            select: {
              id: true,
              profileImage: true,
              name: true,
            },
          },
        },
      });

      if (post == null) return {};

      return {
        id: post.id,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        poster: post.poster,
      };
    }),
  getDynamicData: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input: { postId }, ctx }) => {
      const currentUserId = ctx.session.user.pokemonId;

      const post = await ctx.prisma.post.findFirst({
        where: { id: postId },
        select: {
          comments: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              poster: {
                select: {
                  id: true,
                  profileImage: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          _count: { select: { likes: true, comments: true } },
          likes: { where: { creatorId: currentUserId } },
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
          poster: {
            select: {
              name: true,
            },
          },
        },
      });
    }),
  createPost: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      const post = await ctx.prisma.post.create({
        data: { posterId: ctx.session.user.pokemonId, content },
      });

      return post;
    }),
  toggleLike: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input: { postId }, ctx }) => {
      const data = { postId, creatorId: ctx.session.user.pokemonId };

      const existingLike = await ctx.prisma.like.findUnique({
        where: { creatorId_postId: data },
      });

      if (existingLike == null) {
        await ctx.prisma.like.create({ data });
        return { addedLike: true };
      } else {
        await ctx.prisma.like.delete({ where: { creatorId_postId: data } });
        return { addedLike: false };
      }
    }),
});
