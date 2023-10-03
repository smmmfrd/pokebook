import { type GetServerSideProps } from "next";
import Head from "next/head";
import { caller } from "~/server/api/root";
import { api } from "~/utils/api";

import PostCard, { dateTimeFormatter } from "~/components/PostCard";
import TextInput from "~/components/TextInput";
import ProfileImage from "~/components/ProfileImage";
import Link from "next/link";
import BackHeader from "~/components/BackHeader";
import { useLimit } from "~/utils/hooks";
import type { UserPokemon } from "~/utils/types";
import { getServerSideUserPokemon } from "~/utils/utils";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const userPokemon = await getServerSideUserPokemon(ctx);

  const postId = ctx.query.postId as string;

  const data = await caller.post.getPokemonByPost({ postId });

  const staticPostData = await caller.post.getStaticData({ postId });

  if (data == null || data.poster == null || staticPostData.id == null) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      userPokemon,
      postId,
      pokemonName: data.poster.name,
      staticPostData,
    },
  };
};

type PostPageProps = {
  userPokemon: UserPokemon;
  postId: string;
  pokemonName: string;
  staticPostData: {
    id: string;
    content: string;
    createdAt: string;
    poster: {
      id: number;
      profileImage: string;
      name: string;
      bot: boolean;
    };
  };
};

export default function PostPage({
  userPokemon,
  postId,
  pokemonName,
  staticPostData,
}: PostPageProps) {
  const dynamicPost = api.post.getDynamicData.useQuery({
    postId,
    userPokemonId: userPokemon.id,
  });
  const trpcUtils = api.useContext();

  const useCreateComment = api.comment.createNew.useMutation({
    onSuccess: ({ newComment }) => {
      trpcUtils.post.getDynamicData.setData(
        { postId, userPokemonId: userPokemon.id },
        (oldData) => {
          if (oldData == null || oldData.commentCount == null) return {};

          return {
            ...oldData,
            commentCount: oldData.commentCount + 1,
            comments: [
              {
                id: newComment.id,
                content: newComment.content,
                createdAt: newComment.createdAt,
                poster: {
                  id: userPokemon.id,
                  name: userPokemon.name,
                  profileImage: userPokemon.profileImage,
                },
              },
              ...oldData.comments,
            ],
          };
        }
      );
    },
  });

  const [canComment, tickComments] = useLimit(
    `${userPokemon.name}`,
    "comments",
    10
  );

  function handleSubmit(text: string) {
    tickComments();
    useCreateComment.mutate({
      postId,
      content: text,
      userPokemonId: userPokemon.id,
    });
  }

  const post = {
    id: staticPostData.id,
    content: staticPostData.content,
    createdAt: new Date(staticPostData.createdAt),
    poster: staticPostData.poster,
    commentCount: dynamicPost.data?.commentCount
      ? dynamicPost.data.commentCount
      : 0,
    likeCount: dynamicPost.data?.likeCount ? dynamicPost.data.likeCount : 0,
    likedByMe: dynamicPost.data?.likedByMe ? dynamicPost.data.likedByMe : false,
  };

  return (
    <>
      <Head>
        <title>{`${pokemonName}'s Post | Pokebook`}</title>
      </Head>
      <BackHeader title={`${pokemonName}'s Post`}></BackHeader>
      <PostCard userPokemonId={userPokemon.id} post={post} />
      <TextInput
        pokemonName={userPokemon.name}
        enabled={canComment}
        placeholderText="Leave a Comment..."
        handleSubmit={handleSubmit}
      />
      <div className="mt-2 border-b"></div>
      {useCreateComment.isLoading && (
        <div className="w-full border-b pt-4 text-center">
          <div className="loading loading-dots h-20"></div>
        </div>
      )}
      {dynamicPost.isLoading && (
        <div className="w-full pt-4 text-center">
          <div className="loading loading-infinity loading-lg"></div>
        </div>
      )}
      {dynamicPost.data?.comments?.map((comment) => (
        <Comment comment={comment} key={comment.id} />
      ))}
    </>
  );
}

type CommentProps = {
  comment: {
    content: string;
    createdAt: Date;
    poster: {
      id: number;
      profileImage: string;
      name: string;
      bot: boolean;
    };
  };
};

function Comment({ comment }: CommentProps) {
  return (
    <section
      key={`${comment.createdAt.getTime()}${comment.poster.id}`}
      className="flex gap-4 border-b px-4 pb-3.5 pt-2.5"
    >
      <ProfileImage
        src={comment.poster.profileImage ?? ""}
        styleExtensions="mt-1"
        href={`/profile/${comment.poster.id}`}
        size="medium"
        bot={comment.poster.bot}
      />
      <div className="flex flex-col items-start">
        <p>
          <Link
            className="font-medium capitalize underline-offset-4 hover:underline"
            href={`/profile/${comment.poster.id}`}
            title={`Go to ${comment.poster.name}'s profile...`}
          >
            {comment.poster.name}
          </Link>{" "}
          <span className="text-xs opacity-50">
            {dateTimeFormatter(comment.createdAt)}
          </span>
        </p>
        <p className="">{comment.content}</p>
      </div>
    </section>
  );
}
