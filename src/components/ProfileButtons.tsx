import { useSession } from "next-auth/react";

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

export default function ProfileButtons({ profileId }: { profileId: string }) {
  const session = useSession();

  if (session.status !== "authenticated") return <></>;

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
    return (
      <>
        <button className="btn-info btn-xs btn">Follow</button>
        <button className="btn-success btn-xs btn">Friend Req.</button>
      </>
    );
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
