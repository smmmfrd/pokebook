import { useRouter } from "next/router";
import React from "react";
import NavbarIcon from "./NavbarIcon";

type BackHeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export default function BackHeader({ title, children }: BackHeaderProps) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 bg-base-100">
      <nav className="flex items-center justify-between gap-3 border-b p-4">
        <button onClick={() => router.back()} title="Go Back">
          <NavbarIcon icon="arrowLeft" styleExtensions={"w-5 h-5"} />
        </button>
        <h1 className="grow text-2xl font-bold capitalize">{title}</h1>
      </nav>
      {children}
    </header>
  );
}
