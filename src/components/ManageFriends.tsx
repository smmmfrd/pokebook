import { useRef } from "react";
import { api } from "~/utils/api";
import ProfileImage from "./ProfileImage";
import Link from "next/link";

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
      <dialog ref={supportDialog}>
        <ul>
          {useGetAllFriends.isLoading && (
            <div className="w-full pt-4 text-center">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          )}
          {useGetAllFriends.data != null &&
            useGetAllFriends.data.friends.map((friend) => (
              <li
                className="flex items-center gap-4 border-b p-4"
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
