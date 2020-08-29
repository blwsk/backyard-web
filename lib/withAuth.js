import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { withRouter } from "next/router";

const withAuth = (Component) => {
  return withRouter((props) => {
    return (
      <Auth0Provider
        domain="dev-vp2ukl4j.us.auth0.com"
        clientId="YLqFzSFNBwKHOIlmovDJCwMxcVTIrZnO"
      >
        <Component {...props} />
      </Auth0Provider>
    );
  });
};

export default withAuth;
