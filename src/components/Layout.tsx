import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import Navbar from "./Navbar";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { data: sessionData } = useSession();

  if (!sessionData) return children;

  const [theme, setTheme] = useState("cmyk");

  const toggleTheme = () => {
    setTheme(theme === "cmyk" ? "night" : "cmyk");
  };

  useEffect(() => {
    document.querySelector("html")?.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="flex min-w-full">
      <Navbar
        profileImage={sessionData.user.profileImage}
        userId={sessionData.user.id}
        toggleTheme={toggleTheme}
        requestNotif={
          sessionData.user.sentFriendRequests > 0 &&
          sessionData.user.receivedFriendRequests > 0
        }
      />
      <main className="min-h-screen w-full border-l">{children}</main>
    </div>
  );
}
