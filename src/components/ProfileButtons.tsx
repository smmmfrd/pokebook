import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";

const RELATIONAL_STATES_MAP = {
  self: {},
  none: {
    following: false,
  },
  following: {
    following: true,
    friends: false,
  },
  friends: {
    following: true,
    friends: true,
  },
};

export default function ProfileButtons({
  profileId,
  isFollowing,
}: {
  profileId: string;
  isFollowing: boolean;
}) {
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

  // Viewing your profile
  if (session.data?.user.id === profileId) {
    return (
      <div
        className="tooltip-info tooltip tooltip-left"
        data-tip="You can't follow or friend yourself!"
      >
        <button disabled className="btn-info btn-xs btn">
          Follow
        </button>
      </div>
    );
  } else {
    if (cacheFollow) {
      return (
        <>
          <button
            className="btn-secondary btn-xs btn"
            onClick={handleFollowClick}
            disabled={useFollow.isLoading}
          >
            {useFollow.isLoading ? "..." : "Following"}
          </button>
          <button
            className="btn-success btn-xs btn"
            disabled={useFollow.isLoading}
          >
            Friend Req.
          </button>
        </>
      );
    } else {
      return (
        <button
          disabled={useFollow.isLoading}
          onClick={handleFollowClick}
          className="btn-info btn-xs btn"
        >
          {useFollow.isLoading ? "..." : "Follow"}
        </button>
      );
    }
  }

  return <></>;

  return (
    <div className="flex gap-2">
      {/* <button className="btn-info btn-xs btn">Follow</button> */}
      {/* <button className="btn-error btn-xs btn">Un-Follow</button> */}
      {/* <button className="btn-success btn-xs btn">Friend Req.</button> */}
      {/* <button className="btn-error btn-xs btn">Un-Friend</button> */}
    </div>
  );
}
