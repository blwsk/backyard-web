import React, { useState, useEffect } from "react";
import { validURL, ensureProtocol } from "../lib/urls";
import { useAuthedCallback } from "../lib/requestHooks";
import { jsonFetcherFactory } from "../lib/fetcherFactories";
import { withRouter } from "next/router";

const messages = {
  ALREADY_SAVED: "Already saved.",
  SAVED: "Saved.",
};

const SaveUrl = ({ urlString, router }) => {
  const decodedUrlString = decodeURIComponent(urlString);
  const decodedUrl = ensureProtocol(decodedUrlString);
  const isValid = validURL(decodedUrl);

  const [saveState, updateSaveState] = useState({
    loading: false,
    saved: false,
    data: null,
    error: null,
    message: null,
  });

  const doCreateItem = useAuthedCallback(
    "/api/save-item",
    {
      method: "PUT",
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

  const itemId = saveState.data && saveState.data.id;

  useEffect(() => {
    /**
     * On save success, redirect to the viewer page
     */
    if (typeof itemId === "string") {
      router.replace(`/viewer?id=${itemId}`);
    }
  }, [itemId]);

  return (
    <>
      <div
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        {saveState.message && <h1>{saveState.message}</h1>}
      </div>
      {isValid ? (
        <>
          {saveState.loading && <div>Loading...</div>}
          {saveState.error && <div>Error.</div>}
        </>
      ) : (
        <div className="color-red">Error. URL is invalid.</div>
      )}
    </>
  );
};
export default withRouter(SaveUrl);
