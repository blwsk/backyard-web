import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { withRouter } from "next/router";
import LogoutButton from "./logoutButton";
import LoginButton from "./loginButton";

const AuthInteraction = ({ className, style, router }) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  getAccessTokenSilently({
    audience: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/api/v2/`,
    scope: "read:items",
  }).then((t) => console.log(t));

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
