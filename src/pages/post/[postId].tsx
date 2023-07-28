import { GetServerSideProps } from "next";
import Head from "next/head";
import { caller } from "~/server/api/root";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";

import PostCard, { dateTimeFormatter } from "~/components/PostCard";
import TextInput from "~/components/TextInput";
import ProfileImage from "~/components/ProfileImage";
import Link from "next/link";
import BackHeader from "~/components/BackHeader";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  const postId = ctx.query.postId as string;

  const data = await caller.post.getPokemonByPost({ postId });

  if (!session || data == null || data.user.pokemon == null) {
    return {
      redirect: {
        destination: `/login?returnURL=${encodeURIComponent("")}`,
        permanent: false,
      },
    };
  }

  const pokemonName = `${data.user.pokemon.name
    .slice(0, 1)
    .toUpperCase()}${data.user.pokemon.name.slice(1)}`;

  return {
    props: {
      session,
      postId,
      pokemonName,
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
  const trpcUtils = api.useContext();

  const useCreateComment = api.comment.createNew.useMutation({
    onSuccess: ({ newComment }) => {
      trpcUtils.post.getById.setData({ postId }, (oldData) => {
        if (oldData?.content == null || data == null) return {};

        return {
          ...oldData,
          commentCount: oldData.commentCount + 1,
          comments: [
            {
              id: newComment.id,
              content: newComment.content,
              createdAt: newComment.createdAt,
              user: {
                id: data?.user.id,
                profileImage: data?.user.profileImage,
                pokemon: {
                  name: data?.user.pokemonName,
                },
              },
            },
            ...oldData.comments,
          ],
        };
      });
    },
  });

  function handleSubmit(text: string) {
    useCreateComment.mutate({ postId, content: text });
  }

  if (post.isLoading) {
    return (
      <>
        <Head>
          <title>{`${pokemonName}'s Post`}</title>
        </Head>

        <div className="w-full text-center">
          <div className="loading loading-infinity loading-lg"></div>
        </div>
        <TextInput
          pokemonName={data?.user.pokemonName ?? ""}
          placeholderText="Leave a Comment..."
          handleSubmit={handleSubmit}
        />

        <div className="w-full text-center">
          <div className="loading loading-infinity loading-lg"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${pokemonName}'s Post`}</title>
      </Head>
      <BackHeader title={`${pokemonName}'s Post`}></BackHeader>
      {post.data && post.data.content != null && <PostCard {...post.data} />}
      <TextInput
        pokemonName={data?.user.pokemonName ?? ""}
        placeholderText="Leave a Comment..."
        handleSubmit={handleSubmit}
      />
      <div className="mt-2 border-b"></div>
      {post.data?.comments?.map((comment) => (
        <Comment comment={comment} key={comment.id} />
      ))}
    </>
  );
}

type CommentProps = {
  comment: {
    content: string;
    createdAt: Date;
    user: {
      id: string;
      profileImage: string | null;
      pokemon: {
        name: string;
      } | null;
    } | null;
  };
};

function Comment({ comment }: CommentProps) {
  const pokemonName: string = `${comment.user?.pokemon?.name
    .slice(0, 1)
    .toUpperCase()}${comment.user?.pokemon?.name.slice(1)}`;

  return (
    <section
      key={`${comment.createdAt.getTime()}${comment.user?.id}`}
      className="flex gap-4 border-b px-6 pb-3.5 pt-2.5"
    >
      <ProfileImage
        src={comment.user?.profileImage ?? ""}
        small
        styleExtensions="mt-2"
        href={`/profile/${comment.user?.id}`}
      />
      <div className="flex flex-col items-start gap-0.5">
        <p>
          <Link
            className="capitalize hover:underline"
            href={`/profile/${comment.user?.id}`}
          >
            {pokemonName}{" "}
          </Link>
          <span className="text-xs opacity-50">
            {dateTimeFormatter(comment.createdAt)}
          </span>
        </p>
        <p className="rounded-xl bg-base-content px-2 py-1 text-base-100">
          {comment.content}
        </p>
      </div>
    </section>
  );
}
