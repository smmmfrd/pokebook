import type { FriendStatus } from "~/utils/types";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";

type ProfileButtonsProps = {
  profileId: string;
  isFollowing: boolean;
  friendStatus: FriendStatus;
};

export default function ProfileButtons({
  profileId,
  isFollowing,
  friendStatus,
}: ProfileButtonsProps) {
  const session = useSession();

  if (session.status !== "authenticated") return <></>;

  const [cacheFollow, setCacheFollow] = useState(isFollowing);

  const useFollow = api.profile.toggleFollow.useMutation({
    onSuccess: ({ addedFollow }) => {
      setCacheFollow(addedFollow);
    },
  });

  function handleFollowClick() {
    void useFollow.mutate({ profileId });
  }

  const [cacheFriendStatus, setCacheFriendStatus] = useState(friendStatus);

  const useSendFriendReq = api.profile.sendFriendRequest.useMutation({
    onSuccess: () => {
      setCacheFriendStatus("sent");
    },
  });

  function handleSendFriendRequest() {
    void useSendFriendReq.mutate({ profileId });
  }

  // User viewing their profile
  if (session.data?.user.id === profileId) {
    return (
      <div
        className="tooltip-info tooltip tooltip-right"
        data-tip="You can't follow or friend yourself!"
      >
        <button disabled className="btn-info btn-sm btn">
          Follow
        </button>
      </div>
    );
  } else {
    // User is following this profile
    // Friending UI Here
    if (cacheFollow) {
      if (cacheFriendStatus === "none") {
        return (
          <>
            <button
              className="btn-secondary btn-sm btn"
              onClick={handleFollowClick}
              disabled={useFollow.isLoading}
            >
              {useFollow.isLoading ? "..." : "Following"}
            </button>
            <button
              className="btn-success btn-sm btn"
              onClick={handleSendFriendRequest}
              disabled={useFollow.isLoading}
            >
              Send Friend Req.
            </button>
          </>
        );
      } else if (cacheFriendStatus === "friend") {
        return (
          <>
            <button
              className="btn-secondary btn-sm btn"
              onClick={handleFollowClick}
              disabled={useFollow.isLoading}
            >
              {useFollow.isLoading ? "..." : "Following"}
            </button>
            <button
              className="btn-error btn-sm btn"
              disabled={useFollow.isLoading}
            >
              Un-Friend
            </button>
          </>
        );
      } else {
        if (cacheFriendStatus === "sent") {
          return (
            <>
              <button
                className="btn-secondary btn-sm btn"
                onClick={handleFollowClick}
                disabled={useFollow.isLoading}
              >
                {useFollow.isLoading ? "..." : "Following"}
              </button>
              <button className="btn-sm btn" disabled>
                Friend Req. Sent...
              </button>
            </>
          );
        } else if (cacheFriendStatus === "received") {
          return (
            <>
              <button
                className="btn-secondary btn-sm btn"
                onClick={handleFollowClick}
                disabled={useFollow.isLoading}
              >
                {useFollow.isLoading ? "..." : "Following"}
              </button>
              <button className="btn-sm btn" disabled>
                Accept Friend Req.
              </button>
            </>
          );
        }
      }
    }
    // User is not following this profile
    else {
      return (
        <button
          disabled={useFollow.isLoading}
          onClick={handleFollowClick}
          className="btn-info btn-sm btn"
        >
          {useFollow.isLoading ? "..." : "Follow"}
        </button>
      );
    }
  }

  return <></>;
}
