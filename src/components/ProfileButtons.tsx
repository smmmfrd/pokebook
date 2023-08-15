import type { FriendStatus } from "~/utils/types";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";
import Link from "next/link";

type ProfileButtonsProps = {
  profileId: number;
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

  if (session.data?.user.pokemonId === profileId) {
    return (
      <Link
        href={`/profile/${profileId}/friends`}
        className="btn-info btn my-auto"
      >
        Manage Friends
      </Link>
    );
  } else {
    return (
      <>
        <FollowButton isFollowing={isFollowing} profileId={profileId} />
        <FriendButton friendStatus={friendStatus} profileId={profileId} />
      </>
    );
  }
}

type FollowButtonProps = {
  isFollowing: boolean;
  profileId: number;
};

function FollowButton({ isFollowing, profileId }: FollowButtonProps) {
  const [cacheFollow, setCacheFollow] = useState(isFollowing);

  const useFollow = api.profile.toggleFollow.useMutation({
    onSuccess: ({ addedFollow }) => {
      setCacheFollow(addedFollow);
    },
  });

  function handleFollowClick() {
    void useFollow.mutate({ profileId });
  }

  if (cacheFollow) {
    return (
      <button
        className="btn-secondary btn-sm btn"
        onClick={handleFollowClick}
        disabled={useFollow.isLoading}
      >
        {useFollow.isLoading ? "..." : "Following"}
      </button>
    );
  } else {
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

type FriendButtonProps = {
  friendStatus: FriendStatus;
  profileId: number;
};

function FriendButton({ friendStatus, profileId }: FriendButtonProps) {
  const [cacheFriendStatus, setCacheFriendStatus] = useState(friendStatus);

  const useSendFriendReq = api.profile.sendFriendRequest.useMutation({
    onSuccess: () => {
      setCacheFriendStatus("sent");
    },
  });

  const useUnfriend = api.profile.unfriend.useMutation({
    onSuccess: () => {
      setCacheFriendStatus("none");
    },
  });

  function handleClick() {
    if (cacheFriendStatus === "none") {
      // Send a friend request
      void useSendFriendReq.mutate({ profileId });
    } else {
      void useUnfriend.mutate({ profileId });
    }
  }

  return (
    <button
      className={`${
        cacheFriendStatus === "none" ? "btn-success" : "btn-error"
      } btn-sm btn`}
      onClick={handleClick}
      disabled={
        useSendFriendReq.isLoading ||
        cacheFriendStatus === "received" ||
        cacheFriendStatus === "sent"
      }
    >
      {useSendFriendReq.isLoading || useUnfriend.isLoading
        ? "..."
        : cacheFriendStatus === "none"
        ? "Send Friend Req."
        : cacheFriendStatus === "friend"
        ? "Un-Friend"
        : cacheFriendStatus === "received"
        ? "Accept Friend Req."
        : cacheFriendStatus === "sent"
        ? "Friend Req. Sent..."
        : ""}
    </button>
  );
}
