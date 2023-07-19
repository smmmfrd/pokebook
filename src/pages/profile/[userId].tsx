import { type Pokemon } from "@prisma/client";
import { type GetServerSideProps } from "next";
import { useRouter } from "next/router";
import InfiniteFeed from "~/components/InfiniteFeed";
import NavbarIcon from "~/components/NavbarIcon";
import ProfileImage from "~/components/ProfileImage";
import { caller } from "~/server/api/root";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

type ProfilePageProps = {
  pokemon: Pokemon;
  flavorText: string;
  userId: string;
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

  const userId = ctx.query.userId as string;

  const pokeRes = await caller.pokemon.getPokemon({
    userId,
  });

  if (pokeRes == null || pokeRes.pokemon == null) {
    return { props: { session } };
  }

  const { pokemon } = pokeRes;

  const randomFlavorText = () => {
    const texts = JSON.parse(pokemon.flavorTexts);
    return texts[Math.floor(Math.random() * texts.length)];
  };

  return {
    props: { session, pokemon, flavorText: randomFlavorText(), userId },
  };
};

export default function ProfilePage({
  pokemon,
  flavorText,
  userId,
}: ProfilePageProps) {
  const router = useRouter();

  const infiniteQuery = api.post.infiniteProfileFeed.useInfiniteQuery(
    { userId },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

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
      <InfiniteFeed
        posts={infiniteQuery.data?.pages.flatMap((page) => page.posts)}
        isError={infiniteQuery.isError}
        isLoading={infiniteQuery.isLoading}
        hasMore={infiniteQuery.hasNextPage}
        fetchNewPosts={infiniteQuery.fetchNextPage}
      />
    </>
  );
}
