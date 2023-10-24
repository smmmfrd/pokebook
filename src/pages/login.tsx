import { type GetServerSideProps } from "next";

import { signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { setCookie } from "cookies-next";
import { useRouter } from "next/router";
import { getServerSideUserPokemon } from "~/utils/utils";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const userPokemon = await getServerSideUserPokemon(ctx);

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
          <p>
            Sign in by connecting your Discord account. This process is handled
            by the open-source service{" "}
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
            When you sign in for the first time, you'll be assigned a random
            Pokémon. If you don't post for 3 days, you'll lose it (but you'll
            get another if you return).
          </p>
          <p>
            Alternatively, you can log in as a guest and receive a Pokémon that
            is used for generating content. You'll have all normal site
            functions for an hour during your guest session.
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
