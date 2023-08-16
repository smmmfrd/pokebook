import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

import BackHeader from "~/components/BackHeader";
import ProfileImage from "~/components/ProfileImage";
import Head from "next/head";
import Link from "next/link";

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
    props: { session, user: session.user },
  };
};

type FriendManagementProps = {
  user: {
    profileImage: string;
    pokemonName: string;
    pokemonId: number;
    id: string;
  };
};

export default function FriendManagement({ user }: FriendManagementProps) {
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

  function handleUnfriend(profileId: number) {
    void useUnfriend.mutate({ profileId });
  }

  return (
    <>
      <Head>
        <title>{`${user.pokemonName}'s Friends | Pokebook`}</title>
      </Head>
      <BackHeader
        title={`${user.pokemonName}'s Friends`}
        headExtensions={<ProfileImage size="small" src={user.profileImage} />}
      />
      {useGetAllFriends.isLoading && (
        <div className="w-full pt-4 text-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      )}
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
              href={`/profile/${friend.id}`}
            />
            <div className="flex w-full flex-col gap-2">
              <Link href={`/profile/${friend.id}`} className="hover:underline">
                <h2 className="text-3xl font-bold">{`${friend.name}`}</h2>
              </Link>
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
