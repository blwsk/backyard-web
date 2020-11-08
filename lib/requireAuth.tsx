import React, { ReactElement } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "../components/header";
import Wrapper from "../components/wrapper";
import AuthInteraction from "../components/authInteraction";

const LoginScreen = (props: any): ReactElement => {
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

const requireAuth = (Component, NoAuthComponent = LoginScreen) => (props) => {
  const { isAuthenticated } = useAuth0();

  return isAuthenticated ? (
    <Component {...props} />
  ) : (
    <NoAuthComponent {...props} />
  );
};

export default requireAuth;
