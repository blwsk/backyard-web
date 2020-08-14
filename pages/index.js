import React, { useCallback, useState } from "react";
import { useAuth } from "../lib/useAuth";
import Header from "../components/header";
import Login from "../components/login";
import Wrapper from "../components/wrapper";
import { withRouter } from "next/router";
import { validURL } from "../lib/urls";

const Index = ({ router }) => {
  const { isAuthenticated } = useAuth();

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
        {isAuthenticated ? (
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
          </>
        ) : (
          <Login />
        )}
      </Wrapper>
    </div>
  );
};

export default withRouter(Index);
