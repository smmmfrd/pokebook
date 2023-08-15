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
  };
  commentCount: number;
  likeCount: number;
  likedByMe: boolean;
};

type InfiniteFeedProps = {
  posts?: InfinitePost[];
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean | undefined;
  fetchNewPosts: () => Promise<unknown>;
};

export default function InfiniteFeed({
  posts,
  isError,
  isLoading,
  hasMore,
  fetchNewPosts,
}: InfiniteFeedProps) {
  if (isLoading) return <Loading />;
  if (isError) return <p>error</p>;

  if (posts == null || posts.length === 0) {
    return <h2>No posts found</h2>;
  }

  return (
    <InfiniteScroll
      next={fetchNewPosts}
      hasMore={hasMore || false}
      dataLength={posts.length}
      loader={<Loading />}
    >
      {posts.map((post) => (
        <PostCard {...post} key={post.id} />
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
