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
import type { FriendStatus, ProfileFeedEnum, UserPokemon } from "~/utils/types";
import { useState } from "react";
import { getServerSideUserPokemon } from "~/utils/hooks";

export const getServerSideProps: GetServerSideProps<
  ProfilePageProps | object
> = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const userPokemon = await getServerSideUserPokemon(session);

  const cleanQuery = ctx.query.profileId as string;

  const profileId = parseInt(cleanQuery);

  const profileData = await caller.profile.getById({
    profileId,
    userId: userPokemon.id,
  });

  if (profileData == null || profileData.pokemon == null) {
    return {
      redirect: {
        destination: "404",
        permanent: false,
      },
    };
  }

  const { pokemon: profilePokemon, isFollowing, isFriend } = profileData;

  const randomFlavorText = () => {
    const texts = JSON.parse(profilePokemon.flavorTexts) as string[];
    return texts[Math.floor(Math.random() * texts.length)];
  };

  // FRIENDSHIP STATUS
  const { sent, received } = await caller.profile.friendRequestExists({
    profileId,
    userPokemonId: userPokemon.id,
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
      userPokemon,
      profilePokemon,
      flavorText: randomFlavorText(),
      profileId,
      isFollowing,
      friendStatus,
    },
  };
};

type ProfilePageProps = {
  userPokemon: UserPokemon;
  profilePokemon: Pokemon;
  flavorText: string;
  profileId: number;
  isFollowing: boolean;
  friendStatus: FriendStatus;
};

export default function ProfilePage({
  userPokemon,
  profilePokemon,
  flavorText,
  profileId,
  isFollowing,
  friendStatus,
}: ProfilePageProps) {
  const [feed, setFeed] = useState<ProfileFeedEnum>("posts");

  const infiniteQuery = api.infinite.infiniteProfileFeed.useInfiniteQuery(
    { profileId, userPokemonId: userPokemon.id, where: feed },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  return (
    <>
      <Head>
        <title>{`${profilePokemon.name}'s Profile | Pokebook`}</title>
      </Head>
      <BackHeader title={profilePokemon.name}>
        <div className="flex flex-wrap justify-between gap-8 p-8 pb-6">
          <div className="flex flex-col justify-between">
            <ProfileButtons
              profileId={profileId}
              isFollowing={isFollowing}
              friendStatus={friendStatus}
            />
          </div>
          <ProfileImage
            src={profilePokemon.profileImage}
            styleExtensions="shrink-0 shadow-md"
            size="large"
            bot={profilePokemon.bot}
          />
          <p className="shrink">
            <span className="font-bold">INFO: </span>
            {flavorText}
          </p>
        </div>
        <ul className="tabs w-full justify-between">
          <li
            className={`tab-bordered tab ${
              feed === "posts" ? "tab-active" : ""
            } flex-grow`}
            onClick={() => setFeed("posts")}
          >
            Posts
          </li>
          <li
            className={`tab-bordered tab ${
              feed === "likes" ? "tab-active" : ""
            } flex-grow`}
            onClick={() => setFeed("likes")}
          >
            Likes
          </li>
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
