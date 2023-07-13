import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

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
        },
      });

      const randPokemon =
        availPokemon[Math.floor(Math.random() * availPokemon.length)];
      console.log(randPokemon);

      // Assign it to the user and the user to it.
      const res = await ctx.prisma.user.update({
        where: { id: userId },
        data: {
          pokemonId: randPokemon?.id,
          profileImage: randPokemon?.profileImage,
        },
      });

      console.log(res.profileImage);

      return;
    }),
});
