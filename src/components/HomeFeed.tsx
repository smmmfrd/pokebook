import { api } from "~/utils/api";
import InfiniteFeed from "./InfiniteFeed";
import PostCard from "./Post";

export default function HomeFeed() {
  // const posts = api.post.getHomeFeed.useQuery();
  const infiniteQuery = api.post.infiniteHomeFeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor } // Here we pass the next cursor from the last time it was queried.
  );

  return (
    <>
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
