import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { withRouter } from "next/router";
import LogoutButton from "./logoutButton";
import LoginButton from "./loginButton";

const AuthInteraction = ({ className, style, router }) => {
  const { user, isAuthenticated } = useAuth0();

  return (
    <span className={className} style={style}>
      {isAuthenticated ? (
        <span className="wrapper">
          <LogoutButton />
          <small>{user.email}</small>
        </span>
      ) : (
        <LoginButton redirectTo={router.asPath} />
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

export default withRouter(AuthInteraction);
