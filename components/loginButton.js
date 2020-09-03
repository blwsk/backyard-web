import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = ({ onLogin = () => {}, onFailed = () => {} }) => {
  const { loginWithPopup } = useAuth0();

  return (
    <button
      className="small"
      onClick={() => {
        loginWithPopup().then(onLogin).catch(onFailed);
      }}
    >
      Log In
    </button>
  );
};

export default LoginButton;
