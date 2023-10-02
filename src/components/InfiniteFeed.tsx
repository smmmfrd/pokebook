import InfiniteScroll from "react-infinite-scroll-component";
import PostCard from "./PostCard";

export type InfinitePost = {
  id: string;
  content: string;
  createdAt: Date;
  poster: {
    id: number;
    profileImage: string;
    name: string;
    bot: boolean;
  };
  commentCount: number;
  likeCount: number;
  likedByMe: boolean;
};

type InfiniteFeedProps = {
  userPokemonId: number;
  posts?: InfinitePost[];
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean | undefined;
  fetchNewPosts: () => Promise<unknown>;
};

export default function InfiniteFeed({
  userPokemonId,
  posts,
  isError,
  isLoading,
  hasMore,
  fetchNewPosts,
}: InfiniteFeedProps) {
  if (isLoading) return <Loading />;
  if (isError) return <p>error</p>;

  if (posts == null || posts.length === 0) {
    return (
      <section className="p-8">
        <h2 className="text-center text-lg italic text-neutral-content">
          No Posts found
        </h2>
      </section>
    );
  }

  return (
    <InfiniteScroll
      next={fetchNewPosts}
      hasMore={hasMore || false}
      dataLength={posts.length}
      loader={<Loading />}
    >
      {posts.map((post) => (
        <PostCard post={post} userPokemonId={userPokemonId} key={post.id} />
      ))}
    </InfiniteScroll>
  );
}

function Loading() {
  return (
    <div className="w-full pt-4 text-center">
      <div className="loading loading-infinity loading-lg"></div>
    </div>
  );
}
