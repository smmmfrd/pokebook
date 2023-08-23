import type { Session, Pokemon } from "@prisma/client";
import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";
import { caller } from "~/server/api/root";

import { api } from "~/utils/api";

import InfiniteFeed from "~/components/InfiniteFeed";
import ProfileButtons from "~/components/ProfileButtons";
import ProfileImage from "~/components/ProfileImage";
import Head from "next/head";
import BackHeader from "~/components/BackHeader";
import type { FriendStatus } from "~/utils/types";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session || ctx.query.profileId == null) {
    return {
      redirect: {
        destination: `/login?returnURL=${encodeURIComponent("")}`,
        permanent: false,
      },
    };
  }

  // GET THE PROFILE
  // Queries in next.js can be string | string[]
  const cleanQuery = Array.isArray(ctx.query.profileId)
    ? ctx.query.profileId.join("")
    : ctx.query.profileId;

  const profileId = parseInt(cleanQuery);

  const profileData = await caller.profile.getById({
    profileId,
    userId: session.user.pokemonId,
  });

  if (profileData == null || profileData.pokemon == null) {
    return { props: { session } };
  }

  const { pokemon, isFollowing, isFriend } = profileData;

  const randomFlavorText = () => {
    const texts = JSON.parse(pokemon.flavorTexts) as string[];
    return texts[Math.floor(Math.random() * texts.length)];
  };

  // FRIENDSHIP STATUS
  const { sent, received } = await caller.profile.friendRequestExists({
    profileId,
    userPokemonId: session.user.pokemonId,
  });

  const friendStatus: FriendStatus = isFriend
    ? "friend"
    : sent
    ? "sent"
    : received
    ? "received"
    : "none";

  return {
    props: {
      session,
      pokemon,
      flavorText: randomFlavorText(),
      profileId,
      isFollowing,
      friendStatus,
    },
  };
};

type ProfilePageProps = {
  session: Session;
  pokemon: Pokemon;
  flavorText: string;
  profileId: number;
  isFollowing: boolean;
  friendStatus: FriendStatus;
};

export default function ProfilePage({
  pokemon,
  flavorText,
  profileId,
  isFollowing,
  friendStatus,
}: ProfilePageProps) {
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
        <title>{`${pokemon.name}'s Profile | Pokebook`}</title>
      </Head>
      <BackHeader title={pokemon.name}>
        <div className="flex flex-wrap justify-between gap-8 p-8 pb-6">
          <div className="flex flex-col justify-between">
            <ProfileButtons
              profileId={profileId}
              isFollowing={isFollowing}
              friendStatus={friendStatus}
            />
          </div>
          <ProfileImage
            src={pokemon.profileImage}
            styleExtensions="shrink-0 shadow-md"
            size="large"
          />
          <p className="shrink">
            <span className="font-bold">INFO: </span>
            {flavorText}
          </p>
        </div>
        <ul className="tabs w-full justify-between">
          <li className={`tab-bordered tab tab-active flex-grow`}>Posts</li>
        </ul>
      </BackHeader>
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
