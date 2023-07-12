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
});
