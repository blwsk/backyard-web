import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      className="small"
      onClick={() => {
        loginWithRedirect({
          redirectUri: window.location.origin,
        });
      }}
    >
      Log In
    </button>
  );
};

export default LoginButton;
