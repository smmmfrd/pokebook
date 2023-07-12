import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";

import { signIn } from "next-auth/react";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (session) {
    return {
      redirect: {
        destination: ctx.query.returnURL ? `${ctx.query.returnURL}` : "/",
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
    <main className="flex min-h-screen flex-col items-center px-12 py-40 sm:flex-row">
      <header className="max-w-xs basis-1/2 [&>*]:mb-4">
        <h1 className="text-4xl">Pokébook</h1>
        <p>
          To view any content you must sign in as a registered user, or as a
          guest.
        </p>
        <p>User registration is handled by Next Auth.</p>
      </header>
      <div className="divider divider-vertical sm:divider-horizontal"></div>
      <div className="flex basis-1/2 justify-between gap-12 sm:flex-col sm:items-start">
        <button className="btn-primary btn" onClick={() => void signIn()}>
          Log In
        </button>
        <button className="btn-secondary btn">Guest Log In</button>
      </div>
    </main>
  );
}
