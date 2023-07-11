import { signOut } from "next-auth/react";
import React from "react";
import NavbarIcon from "./NavbarIcon";

export default function Navbar() {
  return (
    <nav className="relative min-h-screen p-8">
      <ul className="sticky top-8 flex flex-col gap-8">
        <NavbarLink>
          <NavbarIcon icon="company" />
          <NavLinkText>Pokébook</NavLinkText>
        </NavbarLink>
        <NavbarLink>
          <NavbarIcon icon="home" />
          <NavLinkText>Home</NavLinkText>
        </NavbarLink>
        <NavbarLink>
          <NavbarIcon icon="profile" />
          <NavLinkText>Profile</NavLinkText>
        </NavbarLink>
        <NavbarLink>
          <NavbarIcon icon="inbox" />
          <NavLinkText>Requests</NavLinkText>
        </NavbarLink>
        <NavbarLink>
          <NavbarIcon icon="about" />
          <NavLinkText>About</NavLinkText>
        </NavbarLink>
        <button
          className="flex items-center gap-4 text-xl"
          onClick={() => void signOut()}
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

function NavbarLink({ children }: ParentProps) {
  return <li className="flex items-center gap-4 text-xl">{children}</li>;
}

function NavLinkText({ children }: ParentProps) {
  return <span className="hidden sm:inline">{children}</span>;
}
