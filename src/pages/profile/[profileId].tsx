import { type Pokemon } from "@prisma/client";
import { type GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getServerAuthSession } from "~/server/auth";
import { caller } from "~/server/api/root";

import { api } from "~/utils/api";

import InfiniteFeed from "~/components/InfiniteFeed";
import NavbarIcon from "~/components/NavbarIcon";
import ProfileButtons from "~/components/ProfileButtons";
import ProfileImage from "~/components/ProfileImage";
import Head from "next/head";
import BackHeader from "~/components/BackHeader";

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

  const profileId = ctx.query.profileId as string;

  const profileData = await caller.profile.getById({
    profileId,
  });

  if (profileData == null || profileData.pokemon == null) {
    return { props: { session } };
  }

  const { pokemon, isFollowing } = profileData;

  const randomFlavorText = () => {
    const texts = JSON.parse(pokemon.flavorTexts);
    return texts[Math.floor(Math.random() * texts.length)];
  };

  return {
    props: {
      session,
      pokemon,
      flavorText: randomFlavorText(),
      profileId,
      isFollowing,
    },
  };
};

type ProfilePageProps = {
  pokemon: Pokemon;
  flavorText: string;
  profileId: string;
  isFollowing: boolean;
};

export default function ProfilePage({
  pokemon,
  flavorText,
  profileId,
  isFollowing,
}: ProfilePageProps) {
  const router = useRouter();

  const infiniteQuery = api.infinite.infiniteProfileFeed.useInfiniteQuery(
    { profileId },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  return (
    <>
      <Head>
        <title>
          {`${pokemon.name[0]?.toUpperCase()}${pokemon.name.slice(1)}`}'s
          Profile | Pokebook
        </title>
      </Head>
      <BackHeader title={pokemon.name}>
        <div className="flex flex-wrap justify-between gap-8 p-8 pb-6">
          <div className="flex flex-col justify-between">
            <ProfileButtons profileId={profileId} isFollowing={isFollowing} />
          </div>
          <ProfileImage
            src={pokemon.profileImage}
            styleExtensions="shrink-0 shadow-md"
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
      </BackHeader>
      {/* <header className="sticky top-0 z-20 bg-base-100">
        <nav className="flex items-center justify-between gap-3 border-b p-4">
          <button onClick={() => router.back()} title="Go Back">
            <NavbarIcon icon="arrowLeft" styleExtensions={"w-5 h-5"} />
          </button>
          <h1 className="grow text-2xl font-bold capitalize">{pokemon.name}</h1>
        </nav>
        <div className="flex flex-wrap justify-between gap-8 p-8 pb-6">
          <div className="flex flex-col justify-between">
            <ProfileButtons profileId={profileId} isFollowing={isFollowing} />
          </div>
          <ProfileImage
            src={pokemon.profileImage}
            styleExtensions="shrink-0 shadow-md"
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
      </header> */}
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
