import { useRef } from "react";
import { api } from "~/utils/api";
import ProfileImage from "./ProfileImage";
import Link from "next/link";
import { IconMap } from "~/utils/IconsMap";

export default function ManageFriends() {
  const trpcUtils = api.useContext();

  const supportDialog = useRef<HTMLDialogElement>(null);

  const useGetAllFriends = api.profile.getAllFriends.useQuery();

  const useUnfriend = api.profile.unfriend.useMutation({
    onSuccess: ({ profileId }) => {
      trpcUtils.profile.getAllFriends.setData(undefined, (oldData) => {
        if (oldData == null || oldData?.friends == null) return undefined;

        const newData = {
          friends: oldData.friends.filter((friend) => friend.id !== profileId),
        };

        return newData;
      });
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
        className="relative w-full max-w-sm rounded-3xl bg-primary py-9"
      >
        <button
          // className="btn-neutral btn-xs btn-circle btn absolute right-2 top-2"
          className="btn-neutral btn-xs btn absolute right-5 top-1.5"
          onClick={() => supportDialog.current?.close()}
          title="Close this popup"
        >
          {/* <span className="h-5 w-5">{IconMap["close"]}</span> */}
          Close
        </button>

        <ul className="flex flex-col px-4">
          {useGetAllFriends.isLoading && (
            <div className="w-full pt-4 text-center">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          )}
          {useGetAllFriends.data != null &&
            useGetAllFriends.data.friends.map((friend) => (
              <li
                className="flex items-center gap-4 rounded-lg bg-primary-focus p-4"
                key={friend.id}
              >
                <ProfileImage
                  size="large"
                  src={friend.profileImage}
                  styleExtensions="shrink-0"
                  href={`/profile/${friend.id}`}
                />
                <div className="flex w-full flex-col gap-2">
                  <Link
                    href={`/profile/${friend.id}`}
                    className="hover:underline"
                  >
                    <h2 className="text-3xl font-bold">{`${friend.name}`}</h2>
                  </Link>
                  <button
                    className="btn-error btn ml-auto block"
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
