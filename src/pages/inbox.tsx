import { type GetServerSideProps } from "next";

import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

import Head from "next/head";
import BackHeader from "~/components/BackHeader";
import ProfileImage from "~/components/ProfileImage";

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
  const { data } = api.profile.getAllFriendRequests.useQuery();

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
          <li className="tab-bordered tab tab-active basis-1/2">
            Received Requests
          </li>
          <li className="tab-bordered tab basis-1/2">Sent Requests</li>
        </ul>
      </BackHeader>
      <div>Received: {data?.received.length}</div>
      <div>Sent: {data?.sent.length}</div>
    </>
  );
}
