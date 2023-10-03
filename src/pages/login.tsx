import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";

import { signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { setCookie } from "cookies-next";
import { useRouter } from "next/router";
import { getServerSideUserPokemon } from "~/utils/hooks";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const userPokemon = await getServerSideUserPokemon(session, ctx);

  if (userPokemon.id > 0) {
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
    props: {},
  };
};

export default function LoginPage() {
  const router = useRouter();

  const { refetch, isLoading } = api.pokemon.getRandomBotPokemon.useQuery(
    undefined,
    {
      enabled: false,
      onSuccess: ({ random }) => {
        console.log(random);

        // Create a cookie that lasts only a day
        setCookie("guest-pokemon", random, {
          maxAge: 3600,
        });

        // Send the user back to where they want to go
        if (router.query.returnURL) {
          void router.push(
            Array.isArray(router.query.returnURL)
              ? router.query.returnURL.join("")
              : router.query.returnURL
          );
        } else {
          void router.push("/");
        }
      },
    }
  );

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
            disabled={!isLoading}
          >
            Log In
          </button>
          <button
            className="btn-secondary btn"
            onClick={() => {
              void refetch();
            }}
            disabled={!isLoading}
          >
            {!isLoading ? (
              <>
                <span className="loading loading-spinner"></span>
                Loading...
              </>
            ) : (
              "Guest Log In"
            )}
          </button>
        </div>
      </main>
    </>
  );
}
