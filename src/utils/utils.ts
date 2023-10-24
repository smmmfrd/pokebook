import type { UserPokemon } from "./types";
import type { PreviewData, GetServerSidePropsContext } from "next";
import type { ParsedUrlQuery } from "querystring";

import { getServerAuthSession } from "~/server/auth";

async function getServerSideUserPokemon(
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
): Promise<UserPokemon> {
  const session = await getServerAuthSession(ctx);

  if (ctx != null) {
    const guestCookie = ctx.req.cookies["guest-pokemon"];
    if (guestCookie != null) {
      const guestPokemon = (await JSON.parse(guestCookie)) as UserPokemon;

      return { ...guestPokemon };
    }
  }

  if (session != null && session.user != null) {
    return {
      id: session.user.pokemonId,
      name: session.user.pokemonName,
      profileImage: session.user.profileImage,
      bot: false,
    };
  }

  return { id: 0, name: "", profileImage: "", bot: false };
}

export { getServerSideUserPokemon };
