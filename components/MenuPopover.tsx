import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./logoutButton";
import Link from "next/link";

const SettingsPopover = () => {
  const { user } = useAuth0();

  return (
    <>
      <span className="popover-body absolute p-4 shadow">
        <div className="mb-4">
          <small>
            <i>Welcome, {user.email}</i>
          </small>
        </div>

        <Link href="/clips">
          <a className="link-black mb-4">Clips</a>
        </Link>

        <Link href="/settings">
          <a className="link-black mb-4">Settings</a>
        </Link>
        <LogoutButton />
      </span>
      <style jsx>{`
        .popover-body {
          top: 24px;
          left: -16px;
          right: 0;
          width: 200px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          background: var(--c3);
          opacity: 0.99;
          z-index: 100;
        }

        @media (max-width: 768px) {
          .popover-body {
            top: 68px;
            left: 0;
            right: 0;
            align-items: flex-end;
            width: 100%;
            border-radius: 0;
          }
        }
      `}</style>
    </>
  );
};

export default SettingsPopover;
