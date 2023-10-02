import moment from "moment";
import Link from "next/link";
import { api } from "~/utils/api";
import { type InfinitePost } from "./InfiniteFeed";
import NavbarIcon from "./NavbarIcon";
import ProfileImage from "./ProfileImage";

export const dateTimeFormatter = (createdAt: Date | string) =>
  moment(createdAt).fromNow();

type PostCardProps = {
  post: InfinitePost;
  userPokemonId: number;
};

export default function PostCard({
  userPokemonId,
  post: { id, content, createdAt, poster, commentCount, likeCount, likedByMe },
}: PostCardProps) {
  const trpcUtils = api.useContext();

  const toggleLike = api.post.toggleLike.useMutation({
    onSuccess: ({ addedLike }) => {
      const countModifier = addedLike ? 1 : -1;

      const updateData: Parameters<
        typeof trpcUtils.infinite.infiniteHomeFeed.setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null) return;

        // Copy all the stuff except for the one post the user liked, increase or decrease it's like count if it was liked or not, and toggle the likedByMe param
        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              posts: page.posts.map((post) => {
                if (post.id === id) {
                  return {
                    ...post,
                    likeCount: post.likeCount + countModifier,
                    likedByMe: addedLike,
                  };
                }

                return post;
              }),
            };
          }),
        };
      };

      trpcUtils.infinite.infiniteHomeFeed.setInfiniteData(
        { where: "none", pokemonId: userPokemonId },
        updateData
      );
      trpcUtils.infinite.infiniteHomeFeed.setInfiniteData(
        { where: "following", pokemonId: userPokemonId },
        updateData
      );

      trpcUtils.infinite.infiniteProfileFeed.setInfiniteData(
        { profileId: poster.id, where: "posts", userPokemonId },
        updateData
      );
      trpcUtils.infinite.infiniteProfileFeed.setInfiniteData(
        { profileId: poster.id, where: "likes", userPokemonId },
        updateData
      );

      trpcUtils.post.getDynamicData.setData({ postId: id }, (oldData) => {
        if (oldData?.likedByMe == null) return {};
        return {
          ...oldData,
          likeCount: oldData.likeCount + countModifier,
          likedByMe: addedLike,
        };
      });
    },
  });

  function handleLike() {
    if (toggleLike.isLoading) return;
    toggleLike.mutate({ postId: id, userPokemonId });
  }

  return (
    <section className="flex w-full flex-col gap-2 border-b px-8 py-4">
      <header className="flex items-start gap-6">
        <ProfileImage
          styleExtensions="relative"
          src={poster.profileImage}
          href={`/profile/${poster.id}`}
          size="large"
          bot={poster.bot}
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Link
              className="text-xl font-bold capitalize underline-offset-8 hover:underline"
              href={`/profile/${poster.id}`}
              title={`Go to ${poster.name}'s profile...`}
            >
              {poster.name}
            </Link>
          </div>
          {/* DATE */}
          <p className="text-xs font-thin">{dateTimeFormatter(createdAt)}</p>
        </div>
      </header>
      <p className="uppercase">{content}</p>
      <footer className="flex gap-2">
        {/* Comment Button */}
        <Link className="btn-ghost btn-sm btn" href={`/post/${id}`}>
          <NavbarIcon icon="comment" styleExtensions="w-6 h-6" />
          {commentCount == null ? (
            <div className="loading loading-spinner loading-sm"></div>
          ) : (
            commentCount
          )}
        </Link>
        {/* LIKE BUTTON */}
        <button className="btn-ghost btn-sm btn" onClick={handleLike}>
          {toggleLike.isLoading ? (
            <div
              className={`loading loading-spinner loading-sm ${
                likedByMe ? "" : "text-secondary"
              }`}
            ></div>
          ) : likedByMe ? (
            <NavbarIcon
              icon="heartFilled"
              styleExtensions="w-6 h-6 fill-secondary"
            />
          ) : (
            <NavbarIcon icon="heart" styleExtensions="w-6 h-6" />
          )}

          {likeCount == null || likedByMe == null ? (
            <div className="loading loading-spinner loading-sm"></div>
          ) : (
            likeCount
          )}
        </button>
      </footer>
    </section>
  );
}

// More twitter looking post style, doesn't work in this project though...
// function AltStylePostCard() {
//   return (
//     <section className="relative flex w-full flex-col gap-2 border-b py-4 pl-20 pr-8">
//       <ProfileImage
//         styleExtensions="absolute top-6 left-4"
//         src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493.png"
//       />
//       <header className="flex items-center gap-2">
//         <p className="text-xl font-bold">Username</p>
//         <p>⋅</p>
//         <p className="text-sm font-thin">Time posted</p>
//       </header>
//       <p>
//         Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem sed iusto
//         nisi sint illum nesciunt perspiciatis eos commodi voluptatibus nulla
//         voluptatum labore, dignissimos porro doloremque harum, blanditiis
//         tenetur? Non, saepe!
//       </p>
//     </section>
//   );
// }
