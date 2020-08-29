import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";

const withAuth = (Component) => {
  return (props) => {
    return (
      <Auth0Provider
        domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
        clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
        cacheLocation="localstorage"
      >
        <Component {...props} />
      </Auth0Provider>
    );
  };
};

export default withAuth;
