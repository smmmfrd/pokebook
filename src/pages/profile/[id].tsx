import { type Pokemon } from "@prisma/client";
import { type GetServerSideProps } from "next";
import { useRouter } from "next/router";
import NavbarIcon from "~/components/NavbarIcon";
import ProfileImage from "~/components/ProfileImage";
import { caller } from "~/server/api/root";
import { getServerAuthSession } from "~/server/auth";

type ProfilePageProps = {
  pokemon: Pokemon;
  flavorText: string;
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

  if (pokeRes == null || pokeRes.pokemon == null) {
    return { props: { session } };
  }

  const { pokemon } = pokeRes;

  const randomFlavorText = () => {
    const texts = JSON.parse(pokemon.flavorTexts);
    return texts[Math.floor(Math.random() * texts.length)];
  };

  return { props: { session, pokemon, flavorText: randomFlavorText() } };
};

export default function ProfilePage({ pokemon, flavorText }: ProfilePageProps) {
  const router = useRouter();

  return (
    <>
      <header>
        <nav>
          <div className="flex items-center gap-4 border-b p-4">
            <button onClick={() => router.back()} title="Go Back">
              <NavbarIcon icon="arrowLeft" styleExtensions="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold capitalize">{pokemon.name}</h1>
          </div>
          <div className="flex gap-8 p-4">
            <ProfileImage
              src={pokemon.profileImage}
              styleExtensions="shrink-0"
            />
            <p className="shrink">
              <span className="font-bold">INFO: </span>
              {flavorText}
            </p>
          </div>
          <ul className="tabs w-full justify-between">
            <li className="tab-bordered tab tab-active flex-grow">Posts</li>
            <li className="tab-bordered tab flex-grow">Likes</li>
          </ul>
        </nav>
      </header>
    </>
  );
}
