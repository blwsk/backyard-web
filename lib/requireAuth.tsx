import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "../components/header";
import Wrapper from "../components/wrapper";
import AuthInteraction from "../components/authInteraction";

const LoginScreen = () => {
  return (
    <div>
      <Header />
      <Wrapper>
        <h1>Login</h1>
        <AuthInteraction />
      </Wrapper>
    </div>
  );
};

const _LoadingComponent = () => null;

const requireAuth = (
  Component,
  NoAuthComponent = LoginScreen,
  LoadingComponent = _LoadingComponent
) => (props) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading || process.browser === false) {
    return <LoadingComponent />;
  }

  return isAuthenticated ? (
    <Component {...props} />
  ) : (
    <NoAuthComponent {...props} />
  );
};

export default requireAuth;
