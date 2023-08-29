import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import Navbar from "./Navbar";
import { api } from "~/utils/api";
import Footer from "./Footer";

type LayoutProps = {
  children: React.ReactNode;
};

const THEMES = {
  light: "cmyk",
  dark: "dark",
};

export default function Layout({ children }: LayoutProps) {
  const { data: sessionData } = useSession();

  const [loaded, setLoaded] = useState<boolean>(false);
  const [theme, setTheme] = useState<string>(THEMES.light);

  useEffect(() => {
    if (!loaded) {
      const answer = localStorage.getItem("theme-preference");
      if (answer == null) {
        localStorage.setItem("theme-preference", THEMES.light);
      } else {
        setTheme(answer);
      }
      setLoaded(true);
    } else {
      document.querySelector("html")?.setAttribute("data-theme", theme);
      localStorage.setItem("theme-preference", theme);
    }
  }, [theme, loaded]);

  const { data } = api.profile.getAllFriendRequests.useQuery(undefined, {
    enabled: !!sessionData,
  });

  if (!sessionData) return <>{children}</>;

  const toggleTheme = () => {
    setTheme(theme === THEMES.light ? THEMES.dark : THEMES.light);
  };

  return (
    <div className="flex min-w-full">
      <Navbar
        profileImage={sessionData.user.profileImage}
        userId={sessionData.user.pokemonId}
        toggleTheme={toggleTheme}
        requestNotif={
          data == null
            ? sessionData.user.sentFriendRequests > 0 ||
              sessionData.user.receivedFriendRequests > 0
            : data.received.length > 0 || data.sent.length > 0
        }
      />
      <main className="-mr-[1px] min-h-screen w-full max-w-xl border-l border-r">
        {children}
      </main>
      <Footer />
    </div>
  );
}
