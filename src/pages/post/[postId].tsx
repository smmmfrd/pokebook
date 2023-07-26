import { GetServerSideProps } from "next";
import PostCard, { PostCardProps } from "~/components/PostCard";
import { caller } from "~/server/api/root";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

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

  return {
    props: {
      session,
      postId,
    },
  };
};

type PostPageProps = {
  postId: string;
};

export default function PostPage({ postId }: PostPageProps) {
  const post = api.post.getById.useQuery({ postId });

  return (
    <>{post.data && post.data.content != null && <PostCard {...post.data} />}</>
  );
}
