import React from "react";
import { useAuth } from "../lib/useAuth";
import Header from "../components/header";
import Login from "../components/login";
import Wrapper from "../components/wrapper";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <Header />
      <Wrapper align="center">
        {isAuthenticated ? (
          <>
            <input
              style={{
                border: `1px solid black`,
                width: `100%`,
                marginBottom: 16,
              }}
              type="text"
              placeholder="https://url-you-want-to-save.com"
            />
            <button style={{ margin: 0 }}>Save</button>
          </>
        ) : (
          <Login />
        )}
      </Wrapper>
    </div>
  );
};

export default Index;
