import React from "react";
import NavbarIcon from "./NavbarIcon";

export default function Navbar() {
  return (
    <nav className="min-h-screen p-8">
      <ul className="flex h-full flex-col gap-8 last:mt-auto">
        <NavbarLink>
          <NavbarIcon icon="company" />
          Pokébook
        </NavbarLink>
        <NavbarLink>
          <NavbarIcon icon="home" />
          Home
        </NavbarLink>
        <NavbarLink>
          <NavbarIcon icon="profile" />
          Profile
        </NavbarLink>
        <NavbarLink>
          <NavbarIcon icon="inbox" />
          Requests
        </NavbarLink>
        <NavbarLink>
          <NavbarIcon icon="about" />
          About
        </NavbarLink>
      </ul>
    </nav>
  );
}

type NavbarLinkProps = {
  children: React.ReactNode;
};

function NavbarLink({ children }: NavbarLinkProps) {
  return <li className="flex items-center gap-4 text-xl">{children}</li>;
}
