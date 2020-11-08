import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { isiOs } from "../lib/isiOs";

const LoginButton = () => {
  const { loginWithRedirect, loginWithPopup } = useAuth0();

  return (
    <button
      className="small m-0"
      onClick={() => {
        if (isiOs()) {
          loginWithRedirect({
            redirectUri: window.location.origin,
          });
          return;
        }

        loginWithPopup({
          redirectUri: window.location.origin,
        });
      }}
    >
      Log In
    </button>
  );
};

export default LoginButton;
