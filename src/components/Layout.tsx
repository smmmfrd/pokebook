import React from "react";
import Navbar from "./Navbar";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-w-full">
      <Navbar />
      <main className="min-h-screen w-full border-l-[1px]">{children}</main>
    </div>
  );
}
