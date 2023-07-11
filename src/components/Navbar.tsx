import React from "react";

export default function Navbar() {
  return (
    <nav className="min-h-screen p-8">
      <ul className="flex h-full flex-col gap-8 last:mt-auto">
        <NavbarLink>
          <NavbarIcon />
          Home
        </NavbarLink>
        <NavbarLink>
          <NavbarIcon />
          Profile
        </NavbarLink>
        <NavbarLink>
          <NavbarIcon /> Footer
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

function NavbarIcon() {
  return (
    <span className="block h-8 w-8 rounded-md border-2 border-black"></span>
  );
}
