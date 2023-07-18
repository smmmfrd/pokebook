import InfiniteScroll from "react-infinite-scroll-component";
import PostCard from "./Post";

type Post = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    profileImage: string | null;
    pokemon: {
      name: string;
    } | null;
  };
};

type InfiniteFeedProps = {
  posts?: Post[];
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
  if (isLoading) return <p>loading...</p>;
  if (isError) return <p>error</p>;

  if (posts == null || posts.length === 0) {
    return <h2>No posts found</h2>;
  }

  return (
    <InfiniteScroll
      next={fetchNewPosts}
      hasMore={hasMore || false}
      dataLength={posts.length}
      loader={<p>loading...</p>}
    >
      {posts.map((post) => (
        <PostCard {...post} />
      ))}
    </InfiniteScroll>
  );
}
