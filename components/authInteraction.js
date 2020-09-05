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
        <span>
          <LogoutButton />
          <small style={{ marginLeft: 8 }}>{user.email}</small>
        </span>
      ) : (
        <LoginButton redirectTo={router.asPath} />
      )}
    </span>
  );
};

export default withRouter(AuthInteraction);
