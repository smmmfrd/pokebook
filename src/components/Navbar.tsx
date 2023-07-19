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
    <nav className="relative min-h-screen px-2 sm:p-8">
      <ul className="sticky top-6 flex flex-col gap-8">
        <NavbarLink href="/">
          <NavbarIcon icon="company" />
          <NavLinkText>Pokébook</NavLinkText>
        </NavbarLink>
        <NavbarLink href="/">
          <NavbarIcon icon="home" />
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
            <NavbarIcon icon="profile" />
          )}
          <NavLinkText>Profile</NavLinkText>
        </NavbarLink>
        <NavbarLink href="/inbox">
          <NavbarIcon icon="inbox" />
          <NavLinkText>Requests</NavLinkText>
        </NavbarLink>
        <NavbarLink href="/about">
          <NavbarIcon icon="about" />
          <NavLinkText>About</NavLinkText>
        </NavbarLink>
        <NavbarLink href="/pokedex">
          <NavbarIcon icon="pokedex" />
          <NavLinkText>Pokedex</NavLinkText>
        </NavbarLink>
        <button
          className="flex items-center gap-4 text-xl"
          onClick={() => void signOut()}
        >
          <NavbarIcon icon="signOut" />
          <NavLinkText>Sign Out</NavLinkText>
        </button>

        {/* THEME TOGGLE */}
        <label className="swap-rotate swap">
          {/* this hidden checkbox controls the state */}
          <input type="checkbox" onClick={toggleTheme} />

          {/* sun icon */}
          <NavbarIcon icon="sun" styleExtensions="swap-on" />

          {/* moon icon */}
          <NavbarIcon icon="moon" styleExtensions="swap-off" />
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
