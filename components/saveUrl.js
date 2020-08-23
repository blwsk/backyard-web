import React, { useState, useEffect } from "react";
import gql from "gql-tag";
import { validURL } from "../lib/urls";
import Metadata from "../components/metadata";
import { gqlFetcher } from "../lib/fetcher";

const messages = {
  ALREADY_SAVED: "Already saved.",
};

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
              _id
              _ts
            }
          }
        `;

      updateSaveState({ ...saveState, loading: true, message: "Saving..." });

      gqlFetcher(query)
        .then((res) => {
          updateSaveState({
            ...saveState,
            saved: true,
            data: res.data.createItem,
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
                message: messages.ALREADY_SAVED,
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
        {saveState.message && <h1>{saveState.message}</h1>}
      </section>
      {isValid ? (
        <>
          {saveState.loading && <div>Loading...</div>}
          {saveState.error && <div>Error.</div>}
          {(saveState.data || saveState.message === messages.ALREADY_SAVED) && (
            <Metadata
              rawUrl={urlString}
              url={urlString}
              itemId={saveState.data ? saveState.data._id : undefined}
              renderPlaceholder={() => <h2>{decodedUrl}</h2>}
            />
          )}
        </>
      ) : (
        <div className="color-red">Error. URL is invalid.</div>
      )}
    </>
  );
};
export default SaveUrl;
