import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { api } from "~/utils/api";
import NavbarIcon from "./NavbarIcon";

type NavbarProps = {
  profileImage: string;
  userId: string;
  toggleTheme: () => void;
};

export default function Navbar({
  profileImage,
  userId,
  toggleTheme,
}: NavbarProps) {
  return (
    <nav className="relative min-h-screen">
      <ul className="sticky top-0 flex h-full max-h-screen flex-col gap-8 p-2 sm:p-8">
        <NavbarLink href="/">
          <NavbarIcon styleExtensions={"w-8 h-8"} icon="company" />
          <NavLinkText>Pokébook</NavLinkText>
        </NavbarLink>
        <NavbarLink href="/">
          <NavbarIcon styleExtensions={"w-8 h-8"} icon="home" />
          <NavLinkText>Home</NavLinkText>
        </NavbarLink>
        <NavbarLink href={`/profile/${userId}`}>
          {profileImage ? (
            <div
              style={
                {
                  "--image-url": `url(${profileImage})`,
                } as React.CSSProperties
              }
              className="h-8 w-8 overflow-hidden rounded-full border-2 border-base-content bg-[image:var(--image-url)] bg-center"
            ></div>
          ) : (
            <NavbarIcon styleExtensions={"w-8 h-8"} icon="profile" />
          )}
          <NavLinkText>Profile</NavLinkText>
        </NavbarLink>
        <NavbarLink href="/inbox">
          <NavbarIcon styleExtensions={"w-8 h-8"} icon="inbox" />
          <NavLinkText>Requests</NavLinkText>
        </NavbarLink>
        <NavbarLink href="/about">
          <NavbarIcon styleExtensions={"w-8 h-8"} icon="about" />
          <NavLinkText>About</NavLinkText>
        </NavbarLink>
        <NavbarLink href="/pokedex">
          <NavbarIcon styleExtensions={"w-8 h-8"} icon="pokedex" />
          <NavLinkText>Pokedex</NavLinkText>
        </NavbarLink>
        <button
          className="flex items-center gap-4 text-xl"
          onClick={() => void signOut()}
        >
          <NavbarIcon styleExtensions={"w-8 h-8"} icon="signOut" />
          <NavLinkText>Sign Out</NavLinkText>
        </button>

        {/* THEME TOGGLE */}
        <label className="swap swap-rotate mt-auto">
          {/* this hidden checkbox controls the state */}
          <input type="checkbox" onClick={toggleTheme} />

          {/* sun icon */}
          <NavbarIcon styleExtensions={"w-8 h-8 swap-on"} icon="sun" />

          {/* moon icon */}
          <NavbarIcon styleExtensions={"w-8 h-8 swap-off"} icon="moon" />
        </label>
      </ul>
    </nav>
  );
}

type ParentProps = {
  children: React.ReactNode;
};

interface NavbarLinkProps extends ParentProps {
  href: string;
}

function NavbarLink({ children, href }: NavbarLinkProps) {
  return (
    <Link className="flex items-center gap-4 text-xl" href={href}>
      {children}
    </Link>
  );
}

function NavLinkText({ children }: ParentProps) {
  return <span className="hidden sm:inline">{children}</span>;
}
