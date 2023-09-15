import { api } from "~/utils/api";

import TextInput from "~/components/TextInput";
import InfiniteFeed from "~/components/InfiniteFeed";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Head from "next/head";
import { useLimit } from "~/utils/hooks";

type FeedEnum = "none" | "following" | "friends";

export default function Home() {
  const session = useSession();
  const trpcUtils = api.useContext();
  const [feed, setFeed] = useState<FeedEnum>("none");

  const newPost = api.post.createPost.useMutation({
    onSuccess: (newPost) => {
      // Here we need to add this new post to our infinite feed, so that the user has a fluid experience.

      if (session.status !== "authenticated" || feed !== "none") return;

      trpcUtils.infinite.infiniteHomeFeed.setInfiniteData(
        { where: feed },
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
              id: session.data.user.pokemonId,
              profileImage: session.data.user.profileImage,
              name: session.data.user.pokemonName,
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
    { where: feed },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor, // Here we pass the next cursor from the last time it was queried.
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const [canPost, tickPosts] = useLimit(
    `${session.data?.user.pokemonName || ""}`,
    "posts",
    5
  );

  function handleSubmit(text: string) {
    tickPosts();
    console.log("User can post:", canPost);

    newPost.mutate({ content: text });
  }

  return (
    <>
      <Head>
        <title>Home | Pokebook</title>
      </Head>
      <nav className="sticky top-0 z-20 w-full bg-base-100">
        <TextInput
          pokemonName={session.data?.user.pokemonName ?? ""}
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
