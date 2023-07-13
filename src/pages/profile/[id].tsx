import { type Pokemon } from "@prisma/client";
import { type GetServerSideProps } from "next";
import { caller } from "~/server/api/root";
import { getServerAuthSession } from "~/server/auth";

type ProfilePageProps = {
  pokemon: Pokemon;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: `/login?returnURL=${encodeURIComponent(ctx.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  const id = ctx.query.id as string;

  const pokeRes = await caller.pokemon.getPokemon({
    userId: id,
  });
  if (pokeRes?.pokemon === undefined) {
    return { props: { session } };
  }
  const { pokemon } = pokeRes;

  return { props: { session, pokemon } };
};

export default function ProfilePage({ pokemon }: ProfilePageProps) {
  return <div>profile for {pokemon.name}</div>;
}
