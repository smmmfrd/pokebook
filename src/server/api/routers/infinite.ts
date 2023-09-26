import { type Prisma } from "@prisma/client";
import { type inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  type createTRPCContext,
} from "~/server/api/trpc";

export const infiniteRouter = createTRPCRouter({
  infiniteHomeFeed: publicProcedure
    .input(
      z.object({
        where: z.enum(["none", "following", "friends"]),
        pokemonId: z.number(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { where, pokemonId, limit = 10, cursor }, ctx }) => {
      return await getInfinitePosts({
        ctx,
        limit,
        pokemonId,
        cursor,
        whereClause:
          where === "following"
            ? {
                poster: {
                  followers: {
                    some: { id: pokemonId },
                  },
                },
              }
            : where === "friends"
            ? {
                poster: {
                  friends: {
                    some: { id: pokemonId },
                  },
                },
              }
            : undefined,
      });
    }),
  infiniteProfileFeed: publicProcedure
    .input(
      z.object({
        profileId: z.number(),
        where: z.enum(["posts", "likes"]),
        userPokemonId: z.number(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(
      async ({
        input: { profileId, userPokemonId, limit = 10, cursor, where },
        ctx,
      }) => {
        if (where === "posts") {
          return await getInfinitePosts({
            ctx,
            limit,
            pokemonId: userPokemonId,
            cursor,
            whereClause: { posterId: profileId },
          });
        }

        return await getInfinitePosts({
          ctx,
          limit,
          pokemonId: userPokemonId,
          cursor,
          whereClause: { likes: { some: { creatorId: profileId } } },
        });
      }
    ),
});

async function getInfinitePosts({
  ctx,
  limit,
  pokemonId,
  cursor,
  whereClause,
}: {
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
  limit: number;
  pokemonId: number;
  cursor: { id: string; createdAt: Date } | undefined;
  whereClause?: Prisma.PostWhereInput;
}) {
  const data = await ctx.prisma.post.findMany({
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    where: whereClause,
    select: {
      id: true,
      content: true,
      createdAt: true,
      _count: { select: { likes: true, comments: true } },
      likes: pokemonId == null ? false : { where: { creatorId: pokemonId } },
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
      poster: post.poster,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      likedByMe: post.likes.length > 0,
    })),
    nextCursor,
  };
}
