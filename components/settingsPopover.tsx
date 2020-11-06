import React, { MouseEventHandler } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./logoutButton";
import Link from "next/link";

const SettingsPopover = ({ onClose }: { onClose: MouseEventHandler }) => {
  const { user } = useAuth0();

  return (
    <>
      <span className="popover-body absolute p-4">
        <div>
          <a className="link-black cursor-pointer" onClick={onClose}>
            Close
          </a>
        </div>
        <hr className="my-3" />
        <div className="mb-2">
          <small>
            <i>Welcome, {user.email}</i>
          </small>
        </div>
        <Link href="/settings">
          <a className="link-black mb-4">Settings</a>
        </Link>
        <LogoutButton />
      </span>
      <style jsx>{`
        .popover-body {
          top: 8px;
          left: 16px;
          right: 16px;
          width: calc(100% - 32px);
          background: var(--c3);
          box-shadow: var(--ghost) 0px 8px 20px 0px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          border-radius: var(--rc);
        }

        hr {
          border-color: var(--c4);
          height: 1px;
          width: 100%;
        }

        @media (min-width: 600px) {
          .popover-body {
            top: 12px;
            left: auto;
            right: auto;
            width: 200px;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
};

export default SettingsPopover;
