import { type GetServerSideProps } from "next";

import { api } from "~/utils/api";

import Head from "next/head";
import BackHeader from "~/components/BackHeader";
import ProfileImage from "~/components/ProfileImage";
import { useState } from "react";
import { getServerSideUserPokemon } from "~/utils/utils";
import type { UserPokemon } from "~/utils/types";

export const getServerSideProps: GetServerSideProps<InboxProps> = async (
  ctx
) => {
  const userPokemon = await getServerSideUserPokemon(ctx);

  return { props: { userPokemon } };
};

type InboxProps = {
  userPokemon: UserPokemon;
};

export default function InboxPage({ userPokemon }: InboxProps) {
  const { data, isLoading } = api.profile.getAllFriendRequests.useQuery({
    pokemonId: userPokemon.id,
  });

  const trpcUtils = api.useContext();

  const updateData = ({
    senderId: removeSenderId,
    receiverId: removeReceiverId,
  }: {
    senderId: number;
    receiverId?: number;
  }) => {
    trpcUtils.profile.getAllFriendRequests.setData(
      {
        pokemonId: userPokemon.id,
      },
      (oldData) => {
        if (oldData?.received == null || oldData?.sent == null)
          return undefined;

        const newData = {
          sent: oldData.sent.filter(
            ({ receiverId }) => receiverId !== removeReceiverId
          ),
          received: oldData.received.filter(
            ({ senderId }) => senderId !== removeSenderId
          ),
        };

        return newData;
      }
    );
  };

  const useAcceptFriendRequest = api.profile.acceptFriendRequest.useMutation({
    onMutate: updateData,
  });

  const useDeleteFriendRequest = api.profile.deleteFriendRequest.useMutation({
    onMutate: updateData,
  });

  const [view, setView] = useState<"received" | "sent">("received");

  return (
    <>
      <Head>
        <title>{`${userPokemon.name}'s Inbox | Pokebook`}</title>
      </Head>
      <BackHeader
        title={`${userPokemon.name}'s Inbox`}
        headExtensions={
          <ProfileImage
            size="medium"
            src={userPokemon.profileImage}
            bot={false}
          />
        }
      >
        <ul className="tabs justify-between pt-2">
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
          user={userPokemon}
          acceptFriendRequest={(senderId) => {
            useAcceptFriendRequest.mutate({
              senderId,
              userPokemonId: userPokemon.id,
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
        bot: boolean;
      };
    }[];
    sent: {
      receiverId: number;
      receiver: {
        profileImage: string;
        name: string;
        bot: boolean;
      };
    }[];
  };
  user: { id: number };
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
            key={`${user.id}${senderId}`}
          >
            <section className="flex gap-2">
              <ProfileImage
                src={sender.profileImage}
                size="medium"
                styleExtensions="shrink-0"
                bot={sender.bot}
                href={`/profile/${senderId}`}
              />
              <p>{`${sender.name}`} sent you a friend request!</p>
            </section>
            <section className="flex gap-1">
              <button
                className="btn-info btn-sm btn"
                onClick={() => acceptFriendRequest(senderId)}
              >
                Accept
              </button>
              <button
                className="btn-error btn-sm btn"
                onClick={() => deleteFriendRequest(senderId, user.id)}
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
            className="flex items-center justify-between gap-2 border-b p-2"
            key={`${receiverId}${user.id}`}
          >
            <section className="flex gap-2">
              <ProfileImage
                src={receiver.profileImage}
                size="medium"
                styleExtensions="shrink-0"
                bot={receiver.bot}
                href={`/profile/${receiverId}`}
              />
              <p>You sent a friend request to {`${receiver.name}`}!</p>
            </section>
            <button
              className="btn-error btn-sm btn"
              onClick={() => deleteFriendRequest(user.id, receiverId)}
            >
              Cancel
            </button>
          </article>
        ))}
      </>
    );
  }
}
