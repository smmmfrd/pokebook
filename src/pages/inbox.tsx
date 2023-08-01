import { type GetServerSideProps } from "next";

import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

import Head from "next/head";
import BackHeader from "~/components/BackHeader";
import ProfileImage from "~/components/ProfileImage";
import { useState } from "react";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: `/login?returnURL=${encodeURIComponent(ctx.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
      user: session.user,
    },
  };
};

type InboxPageProps = {
  user: {
    profileImage: string;
    pokemonName: string;
    id: string;
  };
};

export default function InboxPage({ user }: InboxPageProps) {
  const { data, isLoading } = api.profile.getAllFriendRequests.useQuery();

  const useDeleteFriendRequest = api.profile.deleteFriendRequest.useMutation();

  const [view, setView] = useState<"received" | "sent">("received");

  return (
    <>
      <Head>
        <title>{`${user.pokemonName[0]?.toUpperCase()}${user.pokemonName.slice(
          1
        )}'s Inbox`}</title>
      </Head>
      <BackHeader
        title={`${user.pokemonName[0]?.toUpperCase()}${user.pokemonName.slice(
          1
        )}'s Inbox`}
        headExtensions={<ProfileImage size="medium" src={user.profileImage} />}
      >
        <ul className="tabs justify-between">
          <li
            className={`tab-bordered tab basis-1/2 ${
              view === "received" && "tab-active"
            }`}
            onClick={() => setView("received")}
          >
            Received Requests
          </li>
          <li
            className={`tab-bordered tab basis-1/2 ${
              view === "sent" && "tab-active"
            }`}
            onClick={() => setView("sent")}
          >
            Sent Requests
          </li>
        </ul>
      </BackHeader>
      {!isLoading &&
        (view === "received"
          ? data?.received.map(({ sender, senderId }) => (
              <section
                className="flex items-center justify-between gap-2 border-b p-2"
                key={`${user.id}${senderId}`}
              >
                <ProfileImage
                  src={sender.profileImage}
                  size="medium"
                  styleExtensions="shrink-0"
                />
                <p>
                  {`${sender.pokemon?.name[0]?.toUpperCase()}${sender.pokemon?.name.slice(
                    1
                  )}`}{" "}
                  sent you a friend request!
                </p>
                <button className="btn-info btn-sm btn">Accept</button>
                <button
                  className="btn-error btn-sm btn"
                  onClick={() =>
                    useDeleteFriendRequest.mutate({
                      senderId,
                      receiverId: user.id,
                    })
                  }
                >
                  Decline
                </button>
              </section>
            ))
          : data?.sent.map(({ receiver, receiverId }) => (
              <section
                className="flex items-center justify-around gap-2 border-b p-2"
                key={`${receiverId}${user.id}`}
              >
                <ProfileImage
                  src={receiver.profileImage}
                  size="medium"
                  styleExtensions="shrink-0"
                />
                <p>
                  You sent a friend request to{" "}
                  {`${receiver.pokemon?.name[0]?.toUpperCase()}${receiver.pokemon?.name.slice(
                    1
                  )}`}
                  !
                </p>
                <button
                  className="btn-error btn-sm btn"
                  onClick={() =>
                    useDeleteFriendRequest.mutate({
                      senderId: user.id,
                      receiverId,
                    })
                  }
                >
                  Cancel
                </button>
              </section>
            )))}
    </>
  );
}
