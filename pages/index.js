import React, { useCallback, useState } from "react";
import Header from "../components/header";
import Login from "../components/login";
import Wrapper from "../components/wrapper";
import { withRouter } from "next/router";
import { validURL } from "../lib/urls";
import LoginButton from "../components/loginButton";
import LogoutButton from "../components/logoutButton";
import { useAuth0 } from "@auth0/auth0-react";

const Auth = () => {
  const { user, isAuthenticated } = useAuth0();

  return (
    <div>
      {isAuthenticated ? <LogoutButton /> : <LoginButton />}
      {user && <div>{user.email}</div>}
    </div>
  );
};

const Index = ({ router }) => {
  const [value, updater] = useState("");

  const onChange = useCallback((e) => {
    updater(e.target.value);
  });

  const onSave = useCallback(() => {
    router.push(`/save?url=${encodeURI(value)}`);
  });

  const isValidUrl = validURL(value);

  return (
    <div>
      <Header />
      <Wrapper align="center">
        <h1>Backyard</h1>
        <br />
        <>
          <input
            style={{
              width: `100%`,
              marginBottom: 16,
            }}
            type="text"
            placeholder="https://url-you-want-to-save.com"
            value={value}
            onChange={onChange}
          />
          <button
            style={{ margin: 0 }}
            onClick={onSave}
            disabled={!isValidUrl}
            title={!isValidUrl ? "URL is invalid" : undefined}
          >
            Save
          </button>
          <Auth />
        </>
      </Wrapper>
    </div>
  );
};

export default withRouter(Index);
