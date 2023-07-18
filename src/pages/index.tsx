import { api } from "~/utils/api";

import { InferGetServerSidePropsType, type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";
import { caller } from "~/server/api/root";

import TextInput from "~/components/TextInput";
import InfiniteFeed from "~/components/InfiniteFeed";
import { useSession } from "next-auth/react";

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

  const mon = await caller.pokemon.getPokemon({ userId: session.user.id });

  return {
    props: { session, pokemonName: mon?.pokemon?.name },
  };
};

export default function Home({ pokemonName }: { pokemonName: string }) {
  const session = useSession();
  const trpcUtils = api.useContext();

  const newPost = api.post.createPost.useMutation({
    onSuccess: (newPost) => {
      // Here we need to add this new post to our infinite feed, so that the user has a fluid experience.

      if (session.status !== "authenticated") return;

      trpcUtils.post.infiniteHomeFeed.setInfiniteData({}, (oldData) => {
        if (oldData == null || oldData.pages[0] == null) return;

        const newCachePost = {
          ...newPost,
          // TODO - likes & the rest go here.
          // User data is in the post queries so we need to throw that in here.
          user: {
            id: session.data.user.id,
            profileImage: session.data.user.profileImage,
            pokemon: {
              name: pokemonName,
            },
          },
        };

        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              posts: [newCachePost, ...oldData.pages[0].posts],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
  });

  const infiniteQuery = api.post.infiniteHomeFeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor } // Here we pass the next cursor from the last time it was queried.
  );

  return (
    <>
      <nav className="w-full">
        <TextInput
          pokemonName={pokemonName}
          handleSubmit={(text: string) => newPost.mutate({ content: text })}
        />
        <ul className="tabs w-full justify-between">
          <li className="tab-bordered tab tab-active flex-grow">Timeline</li>
          <li className="tab-bordered tab flex-grow">Following</li>
          <li className="tab-bordered tab flex-grow">Friends</li>
        </ul>
      </nav>
      <InfiniteFeed
        posts={infiniteQuery.data?.pages.flatMap((page) => page.posts)}
        isError={infiniteQuery.isError}
        isLoading={infiniteQuery.isLoading}
        hasMore={infiniteQuery.hasNextPage}
        fetchNewPosts={infiniteQuery.fetchNextPage}
      />
    </>
  );
}

// export default function Home() {
//   const hello = api.example.hello.useQuery({ text: "from tRPC" });

//   return (
//     <>
//       <Head>
//         <title>Create T3 App</title>
//         <meta name="description" content="Generated by create-t3-app" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
//       <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
//         <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
//           <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
//             Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
//           </h1>
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
//             <Link
//               className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
//               href="https://create.t3.gg/en/usage/first-steps"
//               target="_blank"
//             >
//               <h3 className="text-2xl font-bold">First Steps →</h3>
//               <div className="text-lg">
//                 Just the basics - Everything you need to know to set up your
//                 database and authentication.
//               </div>
//             </Link>
//             <Link
//               className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
//               href="https://create.t3.gg/en/introduction"
//               target="_blank"
//             >
//               <h3 className="text-2xl font-bold">Documentation →</h3>
//               <div className="text-lg">
//                 Learn more about Create T3 App, the libraries it uses, and how
//                 to deploy it.
//               </div>
//             </Link>
//           </div>
//           <div className="flex flex-col items-center gap-2">
//             <p className="text-2xl text-white">
//               {hello.data ? hello.data.greeting : "Loading tRPC query..."}
//             </p>
//             <AuthShowcase />
//           </div>
//         </div>
//       </main>
//     </>
//   );
// }

// function AuthShowcase() {
//   const { data: sessionData } = useSession();

//   const { data: secretMessage } = api.example.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined }
//   );

//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <p className="text-center text-2xl text-white">
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//         {secretMessage && <span> - {secretMessage}</span>}
//       </p>
//       <button
//         className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
//         onClick={sessionData ? () => void signOut() : () => void signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// }
