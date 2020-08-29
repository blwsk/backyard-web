import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { withRouter } from "next/router";
import LogoutButton from "./logoutButton";
import LoginButton from "./loginButton";

const AuthInteraction = ({ className, style, router }) => {
  const { isAuthenticated } = useAuth0();

  return (
    <span className={className} style={style}>
      {isAuthenticated ? (
        <LogoutButton />
      ) : (
        <LoginButton redirectTo={router.asPath} />
      )}
    </span>
  );
};

export default withRouter(AuthInteraction);
