import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const pokemonRouter = createTRPCRouter({
  getAllPokemon: publicProcedure.query(async ({ ctx }) => {
    const pokemonData = await ctx.prisma.pokemon.findMany({
      select: {
        id: true,
        name: true,
        profileImage: true,
        user: true,
      },
    });

    const simplePokemon = pokemonData.map((mon) => ({
      ...mon,
      user: !!mon.user,
    }));

    return { simplePokemon };
  }),
  giveUserRandomPokemon: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input: { userId }, ctx }) => {
      // Find a random pokemon
      const availPokemon = await ctx.prisma.pokemon.findMany({
        where: {
          OR: [{ user: null }, { user: undefined }],
        },
        select: {
          id: true,
          profileImage: true,
          name: true,
          _count: {
            select: {
              sentFriendRequests: true,
              receivedFriendRequests: true,
            },
          },
        },
      });

      const randPokemon =
        availPokemon[Math.floor(Math.random() * availPokemon.length)];

      if (randPokemon == null) return {};

      // Assign it to the user and the user to it.
      await ctx.prisma.user.update({
        where: { id: userId },
        data: {
          pokemonId: randPokemon.id,
          profileImage: randPokemon.profileImage,
        },
      });

      return { randPokemon };
    }),
  getPokemon: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input: { userId }, ctx }) => {
      return await ctx.prisma.user.findFirst({
        where: { id: userId },
        select: {
          pokemon: true,
        },
      });
    }),
});
