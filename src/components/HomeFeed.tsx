import { api } from "~/utils/api";
import Post from "./Post";

export default function HomeFeed() {
  const posts = api.post.getHomeFeed.useQuery();

  return (
    <>
      {posts.data?.map((post) => (
        <Post {...post} />
      ))}
    </>
  );
}
