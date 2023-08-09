import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import Navbar from "./Navbar";
import { api } from "~/utils/api";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { data: sessionData } = useSession();

  const [theme, setTheme] = useState("cmyk");

  useEffect(() => {
    document.querySelector("html")?.setAttribute("data-theme", theme);
  }, [theme]);

  const { data } = api.profile.getAllFriendRequests.useQuery();

  if (!sessionData) return children;

  const toggleTheme = () => {
    setTheme(theme === "cmyk" ? "night" : "cmyk");
  };

  return (
    <div className="flex min-w-full">
      <Navbar
        profileImage={sessionData.user.profileImage}
        userId={sessionData.user.id}
        toggleTheme={toggleTheme}
        requestNotif={
          data == null
            ? sessionData.user.sentFriendRequests > 0 ||
              sessionData.user.receivedFriendRequests > 0
            : data.received.length > 0 || data.sent.length > 0
        }
      />
      <main className="min-h-screen w-full max-w-4xl border-l border-r">
        {children}
      </main>
    </div>
  );
}
