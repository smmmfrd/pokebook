import type { FriendStatus, UserPokemon } from "~/utils/types";

import { useState } from "react";
import { api } from "~/utils/api";

import ManageFriends from "./ManageFriends";
import { useRouter } from "next/router";

type ProfileButtonsProps = {
  userPokemon: UserPokemon;
  profileId: number;
  isFollowing: boolean;
  friendStatus: FriendStatus;
};

export default function ProfileButtons({
  userPokemon,
  profileId,
  isFollowing,
  friendStatus,
}: ProfileButtonsProps) {
  if (userPokemon.id === profileId) {
    return <ManageFriends userPokemon={userPokemon} />;
  } else {
    return (
      <>
        <FollowButton
          userPokemonId={userPokemon.id}
          isFollowing={isFollowing}
          profileId={profileId}
        />
        <FriendButton
          userPokemonId={userPokemon.id}
          friendStatus={friendStatus}
          profileId={profileId}
        />
      </>
    );
  }
}

type FollowButtonProps = {
  userPokemonId: number;
  isFollowing: boolean;
  profileId: number;
};

function FollowButton({
  userPokemonId,
  isFollowing,
  profileId,
}: FollowButtonProps) {
  const [cacheFollow, setCacheFollow] = useState(isFollowing);

  const useFollow = api.profile.toggleFollow.useMutation({
    onSuccess: ({ addedFollow }) => {
      setCacheFollow(addedFollow);
    },
  });

  function handleFollowClick() {
    void useFollow.mutate({ profileId, userPokemonId });
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
  userPokemonId: number;
  friendStatus: FriendStatus;
  profileId: number;
};

function FriendButton({
  userPokemonId,
  friendStatus,
  profileId,
}: FriendButtonProps) {
  const router = useRouter();
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
      void useSendFriendReq.mutate({ profileId, userPokemonId });
    } else if (cacheFriendStatus === "received") {
      void router.push("/inbox");
    } else {
      void useUnfriend.mutate({ profileId, userPokemonId });
    }
  }

  return (
    <button
      className={`${
        cacheFriendStatus === "none" ? "btn-success" : "btn-error"
      } btn-sm btn`}
      onClick={handleClick}
      disabled={useSendFriendReq.isLoading || cacheFriendStatus === "sent"}
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
