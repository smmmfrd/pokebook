import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";

import { signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

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
  return (
    <>
      <Head>
        <title>Sign In | Pokebook</title>
      </Head>
      {/* We can return a main here since layout does not render on this page. */}
      <main className="flex min-h-screen flex-col items-center px-12 py-40 sm:flex-row">
        <header className="max-w-xs basis-1/2 [&>*]:mb-4">
          <h1 className="text-4xl">Pokébook</h1>
          <p>To view any content you must sign in, or as a guest.</p>
          <p>You must sign in by connecting a Discord account to this app.</p>
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
        </header>
        <div className="divider divider-vertical max-h-96 sm:divider-horizontal"></div>
        <div className="flex basis-1/2 justify-between gap-12 sm:flex-col sm:items-start">
          <button className="btn-primary btn" onClick={() => void signIn()}>
            Log In
          </button>
          <button className="btn-secondary btn">Guest Log In</button>
        </div>
      </main>
    </>
  );
}
