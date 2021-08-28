import Link from "next/link";
import AuthInteraction from "./authInteraction";
import requireAuth from "../lib/requireAuth";
import { useState } from "react";
import MenuPopover from "./MenuPopover";

const LogoLink = ({ text }: { text?: boolean }) => (
  <Link href="/">
    <a className="flex items-center leading-4 space-x-2 link-black">
      <span className="text-3xl">🏕</span>
      {text && <b>Backyard</b>}
    </a>
  </Link>
);

const popover = (Closed, Opened) => {
  const [open, updateOpen] = useState(false);

  if (open) {
    return <Opened onClose={() => updateOpen(false)} />;
  }

  return <Closed onOpen={() => updateOpen(true)} />;
};

const AuthenticatedHeader = () => {
  return (
    <>
      <span className="mr-6">
        <LogoLink />
      </span>
      <div className="space-x-6">
        <Link href="/my-content">
          <a className="link-black">Saved</a>
        </Link>
        <Link href="/notes">
          <a className="link-black">Notes</a>
        </Link>
        <span>
          {popover(
            ({ onOpen }) => (
              <a className="link-black cursor-pointer" onClick={onOpen}>
                Menu
              </a>
            ),
            ({ onClose }) => (
              <span className="md:relative">
                <a className="link-black cursor-pointer" onClick={onClose}>
                  Close
                </a>
                <MenuPopover />
              </span>
            )
          )}
        </span>
      </div>
    </>
  );
};

const NoAuthHeader = () => {
  return (
    <div className="w-full flex justify-between items-center space-x-6">
      <LogoLink text />
      <AuthInteraction />
    </div>
  );
};

const HeaderWithAuth = requireAuth(AuthenticatedHeader, NoAuthHeader);

const Header = () => {
  return (
    <header className="flex items-center justify-between md:justify-start p-4">
      <HeaderWithAuth />
    </header>
  );
};

export default Header;
