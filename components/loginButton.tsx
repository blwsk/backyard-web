import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { isiOs } from "../lib/isiOs";
import Button from "./ui/Button";

const LoginButton = () => {
  const { loginWithRedirect, loginWithPopup } = useAuth0();

  return (
    <Button
      size="small"
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
    </Button>
  );
};

export default LoginButton;
