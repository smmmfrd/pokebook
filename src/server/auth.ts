import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { caller } from "./api/root";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
      pokemonId: number;
      profileImage: string;
      pokemonName: string;
      sentFriendRequests: number;
      receivedFriendRequests: number;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      const userData = await prisma.user.findFirst({
        where: { id: user.id },
        select: {
          id: true,
          profileImage: true,
          pokemonId: true,
          pokemon: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              sentFriendRequests: true,
              receivedFriendRequests: true,
            },
          },
        },
      });

      if (userData == null) return { ...session };

      // If somehow the user has no pokemon assigned, get a new one
      if (userData.pokemon == null) {
        const { randPokemon: newPokemon } =
          await caller.pokemon.giveUserRandomPokemon({ userId: user.id });

        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            profileImage: newPokemon?.profileImage,
            pokemonId: newPokemon?.id,
            pokemonName: newPokemon?.name,
            sentFriendRequests: userData._count.sentFriendRequests,
            receivedFriendRequests: userData._count.receivedFriendRequests,
          },
        };
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          profileImage: userData.profileImage,
          pokemonId: userData.pokemonId,
          pokemonName: userData.pokemon?.name,
          sentFriendRequests: userData._count.sentFriendRequests,
          receivedFriendRequests: userData._count.receivedFriendRequests,
        },
      };
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        await caller.pokemon.giveUserRandomPokemon({ userId: user.id });
        console.log("ALERT, gave a new guy a pokemon.");
      }

      return;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
