import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
              bot: true,
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
  getDynamicData: publicProcedure
    .input(z.object({ postId: z.string(), userPokemonId: z.number() }))
    .query(async ({ input: { postId, userPokemonId }, ctx }) => {
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
                  bot: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          _count: { select: { likes: true, comments: true } },
          likes: { where: { creatorId: userPokemonId } },
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
  createPost: publicProcedure
    .input(z.object({ content: z.string(), pokemonId: z.number() }))
    .mutation(async ({ input: { content, pokemonId }, ctx }) => {
      const post = await ctx.prisma.post.create({
        data: { posterId: pokemonId, content },
      });

      return post;
    }),
  toggleLike: publicProcedure
    .input(z.object({ postId: z.string(), userPokemonId: z.number() }))
    .mutation(async ({ input: { postId, userPokemonId }, ctx }) => {
      const data = { postId, creatorId: userPokemonId };

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
