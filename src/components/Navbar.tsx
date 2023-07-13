import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { api } from "~/utils/api";
import NavbarIcon from "./NavbarIcon";

type NavbarProps = {
  profileImage: string;
};

export default function Navbar({ profileImage }: NavbarProps) {
  const session = useSession();
  const useDeleteThis = api.example.deleteUser.useMutation();

  function handleSignout() {
    if (session.data) {
      useDeleteThis.mutate({ userId: session.data.user.id });
    }
    void signOut();
  }

  return (
    <nav className="relative min-h-screen p-8">
      <ul className="sticky top-8 flex flex-col gap-8">
        <NavbarLink href="/">
          <NavbarIcon icon="company" />
          <NavLinkText>Pokébook</NavLinkText>
        </NavbarLink>
        <NavbarLink href="/">
          <NavbarIcon icon="home" />
          <NavLinkText>Home</NavLinkText>
        </NavbarLink>
        <NavbarLink href="/profile">
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
          onClick={handleSignout}
        >
          <NavbarIcon icon="signOut" />
          <NavLinkText>Sign Out</NavLinkText>
        </button>
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
