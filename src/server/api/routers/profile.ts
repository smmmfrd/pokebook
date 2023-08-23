import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

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
        },
        isFollowing: profile.followers.some(({ id }) => id === userId),
        isFriend: profile.friends.some(({ id }) => id === userId),
      };
    }),
  toggleFollow: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .mutation(async ({ input: { profileId }, ctx }) => {
      const currentUserId = ctx.session.user.pokemonId;

      const existingFollow = await ctx.prisma.pokemon.findFirst({
        where: { id: profileId, followers: { some: { id: currentUserId } } },
      });

      let addedFollow = false;
      if (existingFollow == null) {
        addedFollow = true;
        await ctx.prisma.pokemon.update({
          where: { id: profileId },
          data: { followers: { connect: { id: currentUserId } } },
        });
      } else {
        addedFollow = false;
        await ctx.prisma.pokemon.update({
          where: { id: profileId },
          data: { followers: { disconnect: { id: currentUserId } } },
        });
      }

      return { addedFollow };
    }),
  getAllFriends: protectedProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.session.user.pokemonId;

    return await ctx.prisma.pokemon.findFirst({
      where: { id: currentUserId },
      select: {
        friends: {
          select: {
            id: true,
            profileImage: true,
            name: true,
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
  sendFriendRequest: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .mutation(async ({ input: { profileId }, ctx }) => {
      const currentUserId = ctx.session.user.pokemonId;

      await ctx.prisma.friendRequest.create({
        data: {
          senderId: currentUserId,
          receiverId: profileId,
        },
      });

      return {};
    }),
  getAllFriendRequests: protectedProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.session.user.pokemonId;

    const received = await ctx.prisma.friendRequest.findMany({
      where: { receiverId: currentUserId },
      select: {
        senderId: true,
        sender: {
          select: {
            profileImage: true,
            name: true,
          },
        },
      },
    });
    const sent = await ctx.prisma.friendRequest.findMany({
      where: { senderId: currentUserId },
      select: {
        receiverId: true,
        receiver: {
          select: {
            profileImage: true,
            name: true,
          },
        },
      },
    });

    return { received, sent };
  }),
  acceptFriendRequest: protectedProcedure
    .input(z.object({ senderId: z.number() }))
    .mutation(async ({ input: { senderId }, ctx }) => {
      const currentUserId = ctx.session.user.pokemonId;

      await ctx.prisma.friendRequest.delete({
        where: { senderId_receiverId: { senderId, receiverId: currentUserId } },
      });

      // Set Sender
      await ctx.prisma.pokemon.update({
        where: { id: senderId },
        data: {
          friends: { connect: { id: currentUserId } },
        },
      });

      // Set Receiver
      await ctx.prisma.pokemon.update({
        where: { id: currentUserId },
        data: {
          friends: { connect: { id: senderId } },
        },
      });

      // return { removeId: senderId };
    }),
  deleteFriendRequest: protectedProcedure
    .input(z.object({ senderId: z.number(), receiverId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const currentUserId = ctx.session.user.pokemonId;

      await ctx.prisma.friendRequest.delete({
        where: { senderId_receiverId: input },
      });

      // return {
      //   removeId:
      //     input.senderId === currentUserId ? input.receiverId : input.senderId,
      // };
    }),
  unfriend: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .mutation(async ({ input: { profileId }, ctx }) => {
      const currentUserId = ctx.session.user.pokemonId;

      await ctx.prisma.pokemon.update({
        where: { id: profileId },
        data: { friends: { disconnect: { id: currentUserId } } },
      });

      await ctx.prisma.pokemon.update({
        where: { id: currentUserId },
        data: { friends: { disconnect: { id: profileId } } },
      });

      return { profileId };
    }),
});
