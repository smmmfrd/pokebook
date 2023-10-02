import { type GetServerSideProps } from "next";

import { getServerAuthSession } from "~/server/auth";

import { api } from "~/utils/api";

import TextInput from "~/components/TextInput";
import InfiniteFeed from "~/components/InfiniteFeed";
import { useState } from "react";
import Head from "next/head";
import { getServerSideUserPokemon, useLimit } from "~/utils/hooks";
import type { HomeFeedEnum, UserPokemon } from "~/utils/types";

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  ctx
) => {
  const session = await getServerAuthSession(ctx);
  const userPokemon = await getServerSideUserPokemon(session, ctx);

  return { props: { userPokemon } };
};

type HomeProps = {
  userPokemon: UserPokemon;
};

export default function Home({ userPokemon }: HomeProps) {
  const trpcUtils = api.useContext();
  const [feed, setFeed] = useState<HomeFeedEnum>("none");

  const newPost = api.post.createPost.useMutation({
    onSuccess: (newPost) => {
      // Here we need to add this new post to our infinite feed, so that the user has a fluid experience.

      if (feed !== "none") return;

      trpcUtils.infinite.infiniteHomeFeed.setInfiniteData(
        { where: feed, pokemonId: userPokemon.id },
        (oldData) => {
          if (oldData == null || oldData.pages[0] == null) return;

          const newCachePost = {
            ...newPost,
            // TODO - the rest goes here.
            likeCount: 0,
            commentCount: 0,
            likedByMe: false,
            // Poster data is in the post queries so we need to throw that in here.
            poster: {
              id: userPokemon.id,
              profileImage: userPokemon.profileImage,
              name: userPokemon.name,
              bot: false,
            },
          };

          return {
            ...oldData,
            pages: [
              {
                ...oldData.pages[0],
                posts: [newCachePost, ...oldData.pages[0].posts],
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      );
    },
  });

  const infiniteQuery = api.infinite.infiniteHomeFeed.useInfiniteQuery(
    { where: feed, pokemonId: userPokemon.id },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor, // Here we pass the next cursor from the last time it was queried.
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const [canPost, tickPosts] = useLimit(`${userPokemon.name}`, "posts", 4);

  function handleSubmit(text: string) {
    tickPosts();

    newPost.mutate({ content: text, pokemonId: userPokemon.id });
  }

  return (
    <>
      <Head>
        <title>Home | Pokebook</title>
      </Head>
      <nav className="sticky top-0 z-20 w-full bg-base-100">
        <TextInput
          pokemonName={userPokemon.name}
          enabled={canPost}
          placeholderText="+ New Post..."
          handleSubmit={handleSubmit}
        />
        <ul className="tabs w-full justify-between">
          <li
            className={`tab-bordered tab ${
              feed === "none" ? "tab-active" : ""
            } flex-grow`}
            onClick={() => setFeed("none")}
          >
            Timeline
          </li>
          <li
            className={`tab-bordered tab ${
              feed === "following" ? "tab-active" : ""
            } flex-grow`}
            onClick={() => setFeed("following")}
          >
            Following
          </li>
          <li
            className={`tab-bordered tab ${
              feed === "friends" ? "tab-active" : ""
            } flex-grow`}
            onClick={() => setFeed("friends")}
          >
            Friends
          </li>
        </ul>
      </nav>
      {newPost.isLoading && (
        <section>
          <div className="w-full border-b pt-4 text-center">
            <div className="loading loading-infinity loading-lg"></div>
          </div>
        </section>
      )}
      <InfiniteFeed
        userPokemonId={userPokemon.id}
        posts={infiniteQuery.data?.pages.flatMap((page) => page.posts)}
        isError={infiniteQuery.isError}
        isLoading={infiniteQuery.isLoading}
        hasMore={infiniteQuery.hasNextPage}
        fetchNewPosts={infiniteQuery.fetchNextPage}
      />
    </>
  );
}
