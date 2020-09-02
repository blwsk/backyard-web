import React, { useState, useEffect } from "react";
import { validURL } from "../lib/urls";
import Metadata from "../components/metadata";
import { useAuthedCallback } from "../lib/requestHooks";
import { jsonFetcherFactory } from "../lib/fetcherFactories";

const messages = {
  ALREADY_SAVED: "Already saved.",
  SAVED: "Saved.",
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

  const doCreateItem = useAuthedCallback(
    "/api/create-item",
    {
      method: "POST",
      body: JSON.stringify({ url: decodedUrl }),
    },
    jsonFetcherFactory
  );

  useEffect(() => {
    if (isValid) {
      updateSaveState({ ...saveState, loading: true, message: "Saving..." });

      doCreateItem()
        .then((res) => {
          updateSaveState({
            ...saveState,
            saved: true,
            data: res.result,
            loading: false,
            error: false,
            message: res.alreadySaved ? messages.ALREADY_SAVED : messages.SAVED,
          });
        })
        .catch((err) => {
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
          {saveState.data && (
            <Metadata
              rawUrl={urlString}
              url={urlString}
              itemId={saveState.data.id}
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
