import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";
import { caller } from "~/server/api/root";
import { api } from "~/utils/api";

import BackHeader from "~/components/BackHeader";
import ProfileImage from "~/components/ProfileImage";
import Head from "next/head";

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

  const pokemonName = `${session.user.pokemonName
    .slice(0, 1)
    .toUpperCase()}${session.user.pokemonName.slice(1)}`;

  return {
    props: { session, user: session.user },
  };
};

type FriendManagementProps = {
  user: {
    profileImage: string;
    pokemonName: string;
    id: string;
  };
};

export default function FriendManagement({ user }: FriendManagementProps) {
  const pokemonName = `${user.pokemonName
    .slice(0, 1)
    .toUpperCase()}${user.pokemonName.slice(1)}`;

  const trpcUtils = api.useContext();

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

  function handleUnfriend(profileId: string) {
    void useUnfriend.mutate({ profileId });
  }

  return (
    <>
      <Head>
        <title>{`${pokemonName}'s Friends`}</title>
      </Head>
      <BackHeader
        title={`${pokemonName}'s Friends`}
        headExtensions={<ProfileImage size="small" src={user.profileImage} />}
      />
      {useGetAllFriends.isLoading && <div>loading...</div>}
      {useGetAllFriends.data != null &&
        useGetAllFriends.data.friends.map((friend) => (
          <section
            className="flex items-center gap-4 border-b p-4"
            key={friend.id}
          >
            <ProfileImage
              size="large"
              src={friend.profileImage}
              styleExtensions="shrink-0"
            />
            <div className="flex w-full flex-col gap-2">
              <h2 className="text-3xl font-bold">{`${friend.pokemon?.name
                .slice(0, 1)
                .toUpperCase()}${friend.pokemon?.name.slice(1)}`}</h2>
              <button
                className="btn-error btn ml-auto block"
                onClick={() => handleUnfriend(friend.id)}
              >
                Un-friend
              </button>
            </div>
          </section>
        ))}
    </>
  );
}
