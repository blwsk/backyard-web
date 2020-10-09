import React, { useCallback, useState, useEffect } from "react";
import Header from "../components/header";
import Wrapper from "../components/wrapper";
import { withRouter } from "next/router";
import { validURL } from "../lib/urls";

const Index = ({ router }) => {
  const [value, updater] = useState("");
  const [focused, updateFocused] = useState(false);

  const onChange = (e) => {
    updater(e.target.value);
  };

  const onSave = () => {
    router.push(`/save?url=${encodeURI(value)}`);
  };

  const isValidUrl = validURL(value);

  const inputError = !isValidUrl && value.length > 0 && !focused;

  const onFocus = () => {
    updateFocused(true);
  };

  const onBlur = () => {
    updateFocused(false);
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      onSave();
    }
  };

  return (
    <div>
      <Header />
      <Wrapper align="center">
        <h1>Backyard</h1>
        <br />
        <div
          style={{
            width: "100%",
            textAlign: "center",
          }}
        >
          <input
            className={inputError ? "error" : ""}
            style={{
              width: `100%`,
              marginBottom: 16,
            }}
            type="text"
            placeholder="https://url-you-want-to-save.com"
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
          />
          {(value || focused) && (
            <button
              style={{ margin: 0 }}
              onClick={onSave}
              disabled={!isValidUrl}
              title={inputError ? "URL is invalid" : undefined}
            >
              Save
            </button>
          )}
        </div>
        <br />
        <div
          style={{
            background: "var(--c8)",
            padding: 16,
            borderRadius: 8,
            width: "100%",
          }}
        >
          <h3>Other ways to save</h3>
          <ul>
            <li>
              <span style={{ marginRight: 8 }}>
                Drag this bookmarklet onto your bookmark bar:
              </span>
              <span
                dangerouslySetInnerHTML={{
                  __html: `
                  <a  href="javascript:(function hey(){ window.open('https://backyard-web.blwsk.vercel.app/save?url=' + encodeURIComponent(window.location.href), '_blank'); })()">
                    <pre style="display:inline;">Save</pre>
                  </a>
                `,
                }}
              />
            </li>
            <li>
              Send links, images, files, and text to{" "}
              <a href="tel:9089671305">9089671305</a> via SMS 🔜
            </li>
            <li>Drag-and-drop a file to upload it 🆕</li>
          </ul>
        </div>
      </Wrapper>
    </div>
  );
};

export default withRouter(Index);
