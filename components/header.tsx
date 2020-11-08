import Link from "next/link";
import AuthInteraction from "./authInteraction";
import requireAuth from "../lib/requireAuth";
import { useState, ReactChild } from "react";
import MenuPopover from "./MenuPopover";

const popover = (Closed, Opened) => {
  const [open, updateOpen] = useState(false);

  if (open) {
    return <Opened onClose={() => updateOpen(false)} />;
  }

  return <Closed onOpen={() => updateOpen(true)} />;
};

const GenericHeader = ({ children }: { children: ReactChild }) => {
  return (
    <header className="flex items-center justify-between md:justify-start p-4">
      {children}
    </header>
  );
};

const AuthenticatedHeader = () => {
  return (
    <GenericHeader>
      <>
        <Link href="/">
          <a className="link-black mr-6">🏕</a>
        </Link>
        <div className="space-x-6">
          <Link href="/my-content">
            <a className="link-black">Saved</a>
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
    </GenericHeader>
  );
};

const NoAuthHeader = () => {
  return (
    <GenericHeader>
      <div className="w-full space-x-6 flex justify-between">
        <Link href="/">
          <a className="link-black">🏕</a>
        </Link>
        <AuthInteraction />
      </div>
    </GenericHeader>
  );
};

const HeaderWithAuth = requireAuth(AuthenticatedHeader, NoAuthHeader);

const Header = () => {
  return <HeaderWithAuth />;
};

export default Header;
