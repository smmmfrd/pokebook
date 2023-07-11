import React from "react";
import Navbar from "./Navbar";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative flex">
      <Navbar />
      <main className="min-h-screen border-l-[1px]">{children}</main>
    </div>
  );
}
