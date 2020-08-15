import React, { useState, useEffect } from "react";
import gql from "gql-tag";
import { validURL } from "../lib/urls";
import Data from "../components/data";
import { gqlFetcher } from "../lib/fetcher";

const SaveUrl = ({ urlString }) => {
  const decodedUrl = decodeURIComponent(urlString);
  const isValid = validURL(decodedUrl);

  const [saveState, updateSaveState] = useState({
    loading: false,
    saved: false,
    data: null,
    error: null,
    message: null,
  });

  useEffect(() => {
    if (isValid) {
      const query = gql`
          mutation {
            createItem(
              data: {
                url: "${decodedUrl}"
              }
            ) {
              url
            }
          }
        `;

      updateSaveState({ ...saveState, loading: true, message: "Saving..." });

      gqlFetcher(query)
        .then((res) => {
          updateSaveState({
            ...saveState,
            saved: true,
            data: res,
            loading: false,
            error: false,
            message: "Saved.",
          });
        })
        .catch((err) => {
          try {
            const alreadySaved = err.errors.some(
              (error) => error.message.indexOf("not unique") > 0
            );
            if (alreadySaved) {
              updateSaveState({
                ...saveState,
                saved: true,
                data: null,
                loading: false,
                error: false,
                message: "Already saved.",
              });

              return;
            }
          } catch (e) {
            void e;
          }

          updateSaveState({
            ...saveState,
            error: err,
            saved: false,
            loading: false,
            message: "Error.",
          });
        });
    }
  }, []);

  return (
    <>
      <section
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        {saveState.message && (
          <h1 className={saveState.error ? "color-red" : undefined}>
            {saveState.message}
          </h1>
        )}
      </section>
      <>
        {isValid ? (
          <Data
            rawUrl={urlString}
            url={urlString}
            renderPlaceholder={() => <h2>{decodedUrl}</h2>}
          />
        ) : (
          <div className="color-red">Error. URL is invalid.</div>
        )}
      </>
    </>
  );
};
export default SaveUrl;
