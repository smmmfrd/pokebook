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
    pokemonId: number;
  };
};

export default function InboxPage({ user }: InboxPageProps) {
  const { data, isLoading } = api.profile.getAllFriendRequests.useQuery();

  const trpcUtils = api.useContext();

  const updateData = ({ removeId }: { removeId: number }) => {
    trpcUtils.profile.getAllFriendRequests.setData(undefined, (oldData) => {
      if (oldData?.received == null || oldData?.sent == null) return undefined;

      const newData = {
        sent: oldData.sent.filter(({ receiverId }) => receiverId !== removeId),
        received: oldData.received.filter(
          ({ senderId }) => senderId !== removeId
        ),
      };

      return newData;
    });
  };

  const useAcceptFriendRequest = api.profile.acceptFriendRequest.useMutation({
    onSuccess: updateData,
  });

  const useDeleteFriendRequest = api.profile.deleteFriendRequest.useMutation({
    onSuccess: updateData,
  });

  const [view, setView] = useState<"received" | "sent">("received");

  return (
    <>
      <Head>
        <title>{`${user.pokemonName}'s Inbox | Pokebook`}</title>
      </Head>
      <BackHeader
        title={`${user.pokemonName}'s Inbox`}
        headExtensions={<ProfileImage size="medium" src={user.profileImage} />}
      >
        <ul className="tabs justify-between">
          <li
            className={`tab-bordered tab basis-1/2 ${
              view === "received" ? "tab-active" : ""
            }`}
            onClick={() => setView("received")}
          >
            <span className="relative">
              {data != null && data?.received.length > 0 && (
                <span className="badge badge-secondary badge-xs absolute -left-3 top-0.5 float-left"></span>
              )}
              Received Requests
            </span>
          </li>
          <li
            className={`tab-bordered tab basis-1/2 ${
              view === "sent" ? "tab-active" : ""
            }`}
            onClick={() => setView("sent")}
          >
            <span className="relative">
              {data != null && data?.sent.length > 0 && (
                <span className="badge badge-secondary badge-xs absolute -left-3 top-0.5 float-left"></span>
              )}
              Sent Requests
            </span>
          </li>
        </ul>
      </BackHeader>
      {!isLoading && data != null && (
        <FriendRequestsDisplay
          view={view}
          data={data}
          user={user}
          acceptFriendRequest={(senderId) => {
            useAcceptFriendRequest.mutate({
              senderId,
            });
          }}
          deleteFriendRequest={(senderId, receiverId) => {
            useDeleteFriendRequest.mutate({
              senderId,
              receiverId,
            });
          }}
        />
      )}
    </>
  );
}

type FriendRequestsDisplayProps = {
  view: "received" | "sent";
  data: {
    received: {
      senderId: number;
      sender: {
        profileImage: string;
        name: string;
      };
    }[];
    sent: {
      receiverId: number;
      receiver: {
        profileImage: string;
        name: string;
      };
    }[];
  };
  user: { pokemonId: number };
  acceptFriendRequest: (senderId: number) => void;
  deleteFriendRequest: (senderId: number, receiverId: number) => void;
};

function FriendRequestsDisplay({
  view,
  data,
  user,
  acceptFriendRequest,
  deleteFriendRequest,
}: FriendRequestsDisplayProps) {
  if (view === "received") {
    return (
      <>
        {data.received.map(({ sender, senderId }) => (
          <article
            className="flex items-center justify-between gap-2 border-b p-2"
            key={`${user.pokemonId}${senderId}`}
          >
            <section>
              <ProfileImage
                src={sender.profileImage}
                size="medium"
                styleExtensions="shrink-0"
              />
              <p>{`${sender.name}`} sent you a friend request!</p>
            </section>
            <section>
              <button
                className="btn-info btn-sm btn"
                onClick={() => acceptFriendRequest(senderId)}
              >
                Accept
              </button>
              <button
                className="btn-error btn-sm btn"
                onClick={() => deleteFriendRequest(senderId, user.pokemonId)}
              >
                Decline
              </button>
            </section>
          </article>
        ))}
      </>
    );
  } else {
    return (
      <>
        {data.sent.map(({ receiver, receiverId }) => (
          <article
            className="flex items-center justify-around gap-2 border-b p-2"
            key={`${receiverId}${user.pokemonId}`}
          >
            <section>
              <ProfileImage
                src={receiver.profileImage}
                size="medium"
                styleExtensions="shrink-0"
              />
              <p>You sent a friend request to {`${receiver.name}`}!</p>
            </section>
            <button
              className="btn-error btn-sm btn"
              onClick={() => deleteFriendRequest(user.pokemonId, receiverId)}
            >
              Cancel
            </button>
          </article>
        ))}
      </>
    );
  }
}
