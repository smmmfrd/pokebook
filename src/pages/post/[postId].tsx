import { GetServerSideProps } from "next";
import PostCard, { PostCardProps } from "~/components/PostCard";
import { caller } from "~/server/api/root";
import { getServerAuthSession } from "~/server/auth";

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

  const postId = ctx.query.postId as string;

  const post = await caller.post.getById({ postId });

  return {
    props: {
      session,
      post,
    },
  };
};

type PostPageProps = {
  post: PostCardProps;
};

export default function PostPage({ post }: PostPageProps) {
  return <PostCard {...post} />;
}
