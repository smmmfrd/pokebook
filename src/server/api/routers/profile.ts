import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const profileRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ profileId: z.string() }))
    .query(async ({ input: { profileId }, ctx }) => {
      const currentUserId = ctx.session?.user.id;

      const profile = await ctx.prisma.user.findFirst({
        where: { id: profileId },
        select: {
          pokemon: true,
          followers: { where: { id: currentUserId } },
          friends: { where: { id: currentUserId } },
        },
      });

      if (profile == null) return {};

      return {
        pokemon: profile.pokemon,
        isFollowing: profile.followers.length > 0,
        isFriend: profile.friends.length > 0,
      };
    }),
  toggleFollow: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ input: { profileId }, ctx }) => {
      const currentUserId = ctx.session.user.id;

      const existingFollow = await ctx.prisma.user.findFirst({
        where: { id: profileId, followers: { some: { id: currentUserId } } },
      });

      let addedFollow = false;
      if (existingFollow == null) {
        addedFollow = true;
        await ctx.prisma.user.update({
          where: { id: profileId },
          data: { followers: { connect: { id: currentUserId } } },
        });
      } else {
        addedFollow = false;
        await ctx.prisma.user.update({
          where: { id: profileId },
          data: { followers: { disconnect: { id: currentUserId } } },
        });
      }

      return { addedFollow };
    }),
  friendRequestExists: publicProcedure
    .input(z.object({ profileId: z.string(), userId: z.string() }))
    .query(async ({ input: { profileId, userId }, ctx }) => {
      const sentFriendReq = await ctx.prisma.friendRequest.findFirst({
        where: {
          senderId: userId,
          receiverId: profileId,
        },
      });
      const receivedFriendReq = await ctx.prisma.friendRequest.findFirst({
        where: {
          senderId: profileId,
          receiverId: userId,
        },
      });

      return {
        sent: !!sentFriendReq,
        received: !!receivedFriendReq,
      };
    }),
  sendFriendRequest: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ input: { profileId }, ctx }) => {
      const currentUserId = ctx.session.user.id;

      await ctx.prisma.friendRequest.create({
        data: {
          senderId: currentUserId,
          receiverId: profileId,
        },
      });

      return {};
    }),
  getAllFriendRequests: protectedProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.session.user.id;

    const received = await ctx.prisma.friendRequest.findMany({
      where: { receiverId: currentUserId },
      select: {
        senderId: true,
        sender: {
          select: {
            profileImage: true,
            pokemon: {
              select: { name: true },
            },
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
            pokemon: {
              select: { name: true },
            },
          },
        },
      },
    });

    return { received, sent };
  }),
  deleteFriendRequest: protectedProcedure
    .input(z.object({ senderId: z.string(), receiverId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.friendRequest.delete({
        where: { senderId_receiverId: input },
      });
    }),
});
