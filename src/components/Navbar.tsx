import { signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";
import NavbarIcon from "./NavbarIcon";
import ProfileImage from "./ProfileImage";
import { deleteCookie } from "cookies-next";

type NavbarProps = {
  profileImage: string;
  userId: number;
  toggleTheme: () => void;
  requestNotif: boolean;
};

export default function Navbar({
  profileImage,
  userId,
  toggleTheme,
  requestNotif,
}: NavbarProps) {
  function handleSignOut() {
    void signOut();
    deleteCookie("guest-pokemon");
  }

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
          {profileImage.length > 0 ? (
            <ProfileImage
              src={profileImage}
              size="small"
              styleExtensions="ring-base-content"
              bot={false}
            />
          ) : (
            <NavbarIcon styleExtensions={"w-8 h-8"} icon="profile" />
          )}
          <NavLinkText>Profile</NavLinkText>
        </NavbarLink>

        <NavbarLink href="/inbox" styleExtensions="indicator">
          {requestNotif && (
            <span
              className="badge badge-secondary badge-xs indicator-start indicator-item indicator-top left-1 top-1"
              title="You Have New Requests"
            ></span>
          )}
          <NavbarIcon styleExtensions={"w-8 h-8"} icon="inbox" />
          <NavLinkText>Requests</NavLinkText>
        </NavbarLink>

        <NavbarLink href="/about">
          <NavbarIcon styleExtensions={"w-8 h-8"} icon="about" />
          <NavLinkText>About</NavLinkText>
        </NavbarLink>

        {/* <NavbarLink href="/items">
          <NavbarIcon styleExtensions={"w-8 h-8"} icon="bulletList" />
          <NavLinkText>Items</NavLinkText>
        </NavbarLink> */}

        <button
          className="flex items-center gap-4 text-xl"
          onClick={handleSignOut}
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
  styleExtensions?: string;
}

function NavbarLink({ children, href, styleExtensions = "" }: NavbarLinkProps) {
  return (
    <Link
      className={`flex items-center gap-4 text-xl ${styleExtensions}`}
      href={href}
    >
      {children}
    </Link>
  );
}

function NavLinkText({ children }: ParentProps) {
  return <span className="hidden sm:inline">{children}</span>;
}
