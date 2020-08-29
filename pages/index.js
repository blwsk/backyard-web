import React, { useCallback, useState } from "react";
import Header from "../components/header";
import Wrapper from "../components/wrapper";
import { withRouter } from "next/router";
import { validURL } from "../lib/urls";

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
        </>
      </Wrapper>
      <br />
      <Wrapper>
        <div>
          <h3>How to save</h3>
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
              <a href="tel:9089671305">9089671305</a> via SMS
            </li>
          </ul>
        </div>
      </Wrapper>
    </div>
  );
};

export default withRouter(Index);
