import Link from "next/link";
import AuthInteraction from "./authInteraction";
import requireAuth from "../lib/requireAuth";
import { useState } from "react";
import SettingsPopover from "./settingsPopover";

const popover = (Closed, Opened) => {
  const [open, updateOpen] = useState(false);

  if (open) {
    return <Opened onClose={() => updateOpen(false)} />;
  }

  return <Closed onOpen={() => updateOpen(true)} />;
};

const GenericHeader = ({ children }) => {
  return (
    <div>
      <header>{children}</header>
      <style jsx>{`
        header {
          padding: 16px;
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

const AuthenticatedHeader = () => {
  return (
    <GenericHeader>
      <>
        <span
          className="logo"
          style={{
            marginRight: 24,
          }}
        >
          <Link href="/">
            <a className="link-black">🏕</a>
          </Link>
        </span>
        <span style={{ marginRight: 20 }}>
          <Link href="/my-content">
            <a className="link-black">Saved</a>
          </Link>
        </span>
        <span style={{ marginRight: 20 }}>
          <Link href="/lists">
            <a className="link-black">Lists</a>
          </Link>
        </span>
        <span style={{ marginRight: 20 }}>
          <Link href="/clips">
            <a className="link-black">Clips</a>
          </Link>
        </span>
        <span style={{ marginRight: 20 }}>
          {popover(
            ({ onOpen }) => (
              <a className="link-black cursor-pointer" onClick={onOpen}>
                Menu
              </a>
            ),
            ({ onClose }) => (
              <SettingsPopover onClose={onClose} />
            )
          )}
        </span>
        <style jsx>{`
          .logo {
            font-size: 30px;
          }
        `}</style>
      </>
    </GenericHeader>
  );
};

const NoAuthHeader = () => {
  return (
    <GenericHeader>
      <div className="wrapper">
        <span className="logo">
          <Link href="/">
            <a className="link-black">🏕</a>
          </Link>
        </span>
        <span>
          <AuthInteraction />
        </span>
      </div>
      <style jsx>{`
        .wrapper {
          width: 100%;
          display: inline-grid;
          grid-template-columns: repeat(2, 50% [col-start]);
        }
        .wrapper span {
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }
        .wrapper span:last-child {
          justify-content: flex-end;
        }
        .logo {
          font-size: 30px;
        }
      `}</style>
    </GenericHeader>
  );
};

const HeaderWithAuth = requireAuth(AuthenticatedHeader, NoAuthHeader);

const Header = () => {
  return <HeaderWithAuth />;
};

export default Header;
