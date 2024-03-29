import React, { CSSProperties } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./logoutButton";
import LoginButton from "./loginButton";
import Link from "next/link";

const AuthInteraction = ({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) => {
  const { user, isAuthenticated } = useAuth0();

  return (
    <span className={className} style={style}>
      {isAuthenticated ? (
        <span className="wrapper">
          <LogoutButton />
          <small>
            <Link href="/settings">
              <a className="color-black">{user.email}</a>
            </Link>
          </small>
        </span>
      ) : (
        <LoginButton />
      )}
      <style jsx>{`
        .wrapper small {
          margin-left: 8px;
        }
        @media (max-width: 600px) {
          .wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </span>
  );
};

export default AuthInteraction;
