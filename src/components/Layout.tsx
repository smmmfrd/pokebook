import React, { useEffect, useState } from "react";

import Navbar from "./Navbar";
import { api } from "~/utils/api";
import Footer from "./Footer";
import { useUserPokemon } from "~/utils/hooks";
import { useSession } from "next-auth/react";

type LayoutProps = {
  children: React.ReactNode;
};

const THEMES = {
  light: "cmyk",
  dark: "dark",
};

export default function Layout({ children }: LayoutProps) {
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

  const session = useSession();
  const [userPokemon, setUserPokemon] = useState({
    id: 0,
    name: "",
    profileImage: "",
  });

  useEffect(() => {
    if (session.data) {
      setUserPokemon({
        id: session.data.user.pokemonId,
        name: session.data.user.pokemonName,
        profileImage: session.data.user.profileImage,
      });
    }
  }, [session.data]);

  const { data } = api.profile.getAllFriendRequests.useQuery(
    { pokemonId: userPokemon.id },
    {
      enabled: userPokemon.id > 0,
    }
  );

  if (session.data == null) return <>{children}</>;

  const toggleTheme = () => {
    setTheme(theme === THEMES.light ? THEMES.dark : THEMES.light);
  };

  return (
    <div className="flex min-w-full">
      <Navbar
        profileImage={userPokemon.profileImage}
        userId={userPokemon.id}
        toggleTheme={toggleTheme}
        requestNotif={
          data != null
            ? data.received.length > 0 || data.sent.length > 0
            : false
        }
      />
      <main className="-mr-[1px] min-h-screen w-full max-w-xl border-l border-r">
        {children}
      </main>
      <Footer />
    </div>
  );
}
