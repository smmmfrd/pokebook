import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ profileId: z.number(), userId: z.number() }))
    .query(async ({ input: { profileId, userId }, ctx }) => {
      const profile = await ctx.prisma.pokemon.findFirst({
        where: { id: profileId },
        select: {
          name: true,
          profileImage: true,
          flavorTexts: true,
          bot: true,
          followers: {
            select: {
              id: true,
            },
          },
          friends: {
            select: {
              id: true,
            },
          },
        },
      });

      if (profile == null) return {};

      return {
        pokemon: {
          name: profile.name,
          profileImage: profile.profileImage,
          flavorTexts: profile.flavorTexts,
          bot: profile.bot,
        },
        isFollowing: profile.followers.some(({ id }) => id === userId),
        isFriend: profile.friends.some(({ id }) => id === userId),
      };
    }),
  toggleFollow: publicProcedure
    .input(z.object({ profileId: z.number(), userPokemonId: z.number() }))
    .mutation(async ({ input: { profileId, userPokemonId }, ctx }) => {
      const existingFollow = await ctx.prisma.pokemon.findFirst({
        where: { id: profileId, followers: { some: { id: userPokemonId } } },
      });

      let addedFollow = false;
      if (existingFollow == null) {
        addedFollow = true;
        await ctx.prisma.pokemon.update({
          where: { id: profileId },
          data: { followers: { connect: { id: userPokemonId } } },
        });
      } else {
        addedFollow = false;
        await ctx.prisma.pokemon.update({
          where: { id: profileId },
          data: { followers: { disconnect: { id: userPokemonId } } },
        });
      }

      return { addedFollow };
    }),
  getAllFriends: publicProcedure
    .input(z.object({ pokemonId: z.number() }))
    .query(async ({ input: { pokemonId }, ctx }) => {
      return await ctx.prisma.pokemon.findFirst({
        where: { id: pokemonId },
        select: {
          friends: {
            select: {
              id: true,
              profileImage: true,
              name: true,
              bot: true,
            },
          },
        },
      });
    }),
  friendRequestExists: publicProcedure
    .input(z.object({ profileId: z.number(), userPokemonId: z.number() }))
    .query(async ({ input: { profileId, userPokemonId }, ctx }) => {
      const sentFriendReq = await ctx.prisma.friendRequest.findFirst({
        where: {
          senderId: userPokemonId,
          receiverId: profileId,
        },
      });
      const receivedFriendReq = await ctx.prisma.friendRequest.findFirst({
        where: {
          senderId: profileId,
          receiverId: userPokemonId,
        },
      });

      return {
        sent: !!sentFriendReq,
        received: !!receivedFriendReq,
      };
    }),
  sendFriendRequest: publicProcedure
    .input(z.object({ profileId: z.number(), userPokemonId: z.number() }))
    .mutation(async ({ input: { profileId, userPokemonId }, ctx }) => {
      await ctx.prisma.friendRequest.create({
        data: {
          senderId: userPokemonId,
          receiverId: profileId,
        },
      });

      return {};
    }),
  getAllFriendRequests: publicProcedure
    .input(z.object({ pokemonId: z.number() }))
    .query(async ({ input: { pokemonId }, ctx }) => {
      const received = await ctx.prisma.friendRequest.findMany({
        where: { receiverId: pokemonId },
        select: {
          senderId: true,
          sender: {
            select: {
              profileImage: true,
              name: true,
              bot: true,
            },
          },
        },
      });
      const sent = await ctx.prisma.friendRequest.findMany({
        where: { senderId: pokemonId },
        select: {
          receiverId: true,
          receiver: {
            select: {
              profileImage: true,
              name: true,
              bot: true,
            },
          },
        },
      });

      return { received, sent };
    }),
  acceptFriendRequest: publicProcedure
    .input(z.object({ senderId: z.number(), userPokemonId: z.number() }))
    .mutation(async ({ input: { senderId, userPokemonId }, ctx }) => {
      await ctx.prisma.friendRequest.delete({
        where: { senderId_receiverId: { senderId, receiverId: userPokemonId } },
      });

      // Set Sender
      await ctx.prisma.pokemon.update({
        where: { id: senderId },
        data: {
          friends: { connect: { id: userPokemonId } },
        },
      });

      // Set Receiver
      await ctx.prisma.pokemon.update({
        where: { id: userPokemonId },
        data: {
          friends: { connect: { id: senderId } },
        },
      });

      // return { removeId: senderId };
    }),
  deleteFriendRequest: publicProcedure
    .input(z.object({ senderId: z.number(), receiverId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.friendRequest.delete({
        where: { senderId_receiverId: input },
      });

      // return {
      //   removeId:
      //     input.senderId === currentUserId ? input.receiverId : input.senderId,
      // };
    }),
  unfriend: publicProcedure
    .input(z.object({ profileId: z.number(), userPokemonId: z.number() }))
    .mutation(async ({ input: { profileId, userPokemonId }, ctx }) => {
      await ctx.prisma.pokemon.update({
        where: { id: profileId },
        data: { friends: { disconnect: { id: userPokemonId } } },
      });

      await ctx.prisma.pokemon.update({
        where: { id: userPokemonId },
        data: { friends: { disconnect: { id: profileId } } },
      });

      return { profileId };
    }),
});
