import { GetServerSideProps } from "next";
import Head from "next/head";
import { caller } from "~/server/api/root";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

import PostCard from "~/components/PostCard";
import TextInput from "~/components/TextInput";
import { useSession } from "next-auth/react";
import { Comment } from "@prisma/client";

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
  const post = api.post.getById.useQuery(
    { postId },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );
  const { data } = useSession();

  const useCreateComment = api.comment.createNew.useMutation({});

  function handleSubmit(text: string) {
    useCreateComment.mutate({ postId, content: text });
  }

  return (
    <>
      <Head>
        <title>
          {`${pokemonName[0]?.toUpperCase()}${pokemonName.slice(1)}`}'s Post
        </title>
      </Head>
      {post.data && post.data.content != null && <PostCard {...post.data} />}
      <TextInput
        pokemonName={data?.user.pokemonName ?? ""}
        placeholderText="Leave a Comment..."
        handleSubmit={handleSubmit}
      />
      {post.data?.comments?.map((comment) => (
        <Comment comment={comment} />
      ))}
    </>
  );
}

function Comment({ comment }: { comment: Comment }) {
  return <section>Comment</section>;
}
