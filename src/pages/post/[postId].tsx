import { GetServerSideProps } from "next";
import Head from "next/head";
import PostCard from "~/components/PostCard";
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

  const data = await caller.post.getPokemonByPost({ postId });

  return {
    props: {
      session,
      postId,
      pokemonName: data?.user.pokemon?.name ?? "",
    },
  };
};

type PostPageProps = {
  postId: string;
  pokemonName: string;
};

export default function PostPage({ postId, pokemonName }: PostPageProps) {
  const post = api.post.getById.useQuery({ postId });

  return (
    <>
      <Head>
        <title>
          {`${pokemonName[0]?.toUpperCase()}${pokemonName.slice(1)}`}'s Post
        </title>
      </Head>
      {post.data && post.data.content != null && <PostCard {...post.data} />}
    </>
  );
}
