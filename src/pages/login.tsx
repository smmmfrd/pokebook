import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";

import { signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { useEffect } from "react";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (session) {
    return {
      redirect: {
        destination: ctx.query.returnURL
          ? `${
              Array.isArray(ctx.query.returnURL)
                ? ctx.query.returnURL.join()
                : ctx.query.returnURL
            }`
          : "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

export default function LoginPage() {
  const { data, refetch, isLoading } = api.pokemon.getRandomBotPokemon.useQuery(
    undefined,
    {
      enabled: false,
    }
  );

  useEffect(() => {
    if (data?.random != null) {
      console.log(data.random);
    }
  }, [data, isLoading]);

  return (
    <>
      <Head>
        <title>Sign In | Pokebook</title>
      </Head>
      {/* We can return a main here since layout does not render on this page. */}
      <main className="flex min-h-screen flex-col items-center px-12 py-40 sm:flex-row">
        <header className="max-w-xs basis-1/2 [&>*]:mb-4">
          <h1 className="text-4xl">Pokébook</h1>
          <p>You must sign in by connecting a Discord account to this site.</p>
          <p>
            This connection is handled by the open source authentication service{" "}
            <Link
              href={"https://next-auth.js.org/getting-started/introduction"}
              rel="noopener noreferrer"
              target="_blank"
              className="link font-bold"
            >
              Next Auth.
            </Link>{" "}
          </p>
          <p>
            On signing in for the first time, you will be assigned a random
            pokèmon, and if you do not post for 3 days, you will lose it (if you
            come back you will get another).
          </p>
        </header>
        <div className="divider divider-vertical max-h-96 sm:divider-horizontal"></div>

        <div className="flex basis-1/2 justify-between gap-12 sm:flex-col sm:items-start">
          <button
            className="btn-primary btn sm:mr-auto"
            onClick={() => void signIn()}
          >
            Log In
          </button>
          <button
            className="btn-secondary btn"
            onClick={async () => {
              void refetch();
            }}
          >
            Guest Log In
          </button>
        </div>
      </main>
    </>
  );
}
