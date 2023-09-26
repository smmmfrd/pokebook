import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Layout from "~/components/Layout";

import { useEffect } from "react";
import { useGuestStore } from "~/store/GuestStore";
import { getCookie } from "cookies-next";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const { setGuestPokemon } = useGuestStore();

  useEffect(() => {
    async function getGuest() {
      const guestCookie = getCookie("guest-pokemon");
      if (guestCookie != null) {
        const guestData = await JSON.parse(guestCookie);
        setGuestPokemon(guestData);
      }
    }

    getGuest();
  }, []);

  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
