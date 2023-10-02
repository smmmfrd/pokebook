import { useRef } from "react";
import { api } from "~/utils/api";
import ProfileImage from "./ProfileImage";
import Link from "next/link";
import type { UserPokemon } from "~/utils/types";

type ManageFriendsProps = {
  userPokemon: UserPokemon;
};

export default function ManageFriends({ userPokemon }: ManageFriendsProps) {
  const trpcUtils = api.useContext();

  const supportDialog = useRef<HTMLDialogElement>(null);

  const useGetAllFriends = api.profile.getAllFriends.useQuery({
    pokemonId: userPokemon.id,
  });

  const useUnfriend = api.profile.unfriend.useMutation({
    onSuccess: ({ profileId }) => {
      trpcUtils.profile.getAllFriends.setData(
        {
          pokemonId: userPokemon.id,
        },
        (oldData) => {
          if (oldData == null || oldData?.friends == null) return undefined;

          const newData = {
            friends: oldData.friends.filter(
              (friend) => friend.id !== profileId
            ),
          };

          return newData;
        }
      );
    },
  });

  function handleUnfriend(profileId: number) {
    void useUnfriend.mutate({ profileId });
  }

  return (
    <>
      <button
        onClick={() => supportDialog.current?.showModal()}
        className="btn-info btn my-auto"
      >
        Manage Friends
      </button>
      <dialog
        ref={supportDialog}
        className="relative w-full max-w-sm rounded-3xl bg-primary px-11 py-11"
      >
        <button
          className="btn-neutral btn-sm btn absolute right-5 top-1.5 z-10"
          onClick={(e) => {
            e.stopPropagation();
            supportDialog.current?.close();
          }}
          title="Close this popup"
        >
          {/* <span className="h-5 w-5">{IconMap["close"]}</span> */}
          Close
        </button>

        <ul className="flex max-h-[576px] flex-col gap-4 overflow-x-auto overflow-y-visible">
          {useGetAllFriends.isLoading && (
            <div className="w-full pt-4 text-center">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          )}
          {useGetAllFriends.data != null &&
            useGetAllFriends.data.friends.map((friend) => (
              <li
                className="flex gap-4 rounded-lg bg-primary-focus p-4"
                key={friend.id}
              >
                <ProfileImage
                  size="small"
                  src={friend.profileImage}
                  styleExtensions="shrink-0"
                  href={`/profile/${friend.id}`}
                  bot={friend.bot}
                />
                <div className="flex w-full flex-col justify-between gap-2">
                  <Link
                    href={`/profile/${friend.id}`}
                    className="underline-offset-8 hover:underline"
                  >
                    <h2 className="text-3xl font-bold">{`${friend.name}`}</h2>
                  </Link>
                  <button
                    className="btn-error btn-sm btn ml-auto block"
                    onClick={() => handleUnfriend(friend.id)}
                  >
                    Un-friend
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </dialog>
    </>
  );
}
