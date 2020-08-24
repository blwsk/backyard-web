import useSWR from "swr";
import { jsonParser, jsonFetcher } from "../lib/fetcher";
import { getHostname } from "../lib/urls";
import { useEffect, useCallback, useState } from "react";
import { debounce } from "../lib/debounce";

export const fetcher = (path, options) => {
  return fetch(path, options).then(jsonParser);
};

const Data = ({ url, rawUrl, renderPlaceholder, itemId }) => {
  const { data, error } = useSWR(
    `https://backyard-data.vercel.app/api/index?url=${rawUrl}`,
    // `http://localhost:3001/api/index?url=${rawUrl}`,
    fetcher
  );

  const { hostname, withProtocol } = getHostname(url);

  const [viewportSizeKey, updateViewportSizeKey] = useState(
    `${window.innerHeight}.${window.innerWidth}`
  );

  const [selection, updateSelection] = useState({
    text: null,
    htmlChunk: null,
  });

  const [textSelectionSaveState, updateTextSelectionSaveState] = useState({
    started: false,
  });

  const onSelectionChange = useCallback(
    debounce(() => {
      const currentSelection = document.getSelection();

      if (currentSelection && !currentSelection.isCollapsed) {
        const text = currentSelection.toString();
        let htmlChunk;

        if (
          currentSelection.focusNode &&
          currentSelection.focusNode.parentElement
        ) {
          htmlChunk = currentSelection.focusNode.parentElement.innerHTML;
        }

        updateSelection({
          text,
          htmlChunk,
          anchorNode: currentSelection.anchorNode,
          focusNode: currentSelection.focusNode,
        });
      } else {
        updateSelection({
          text: null,
          htmlChunk: null,
          anchorNode: null,
          focusNode: null,
        });
        updateTextSelectionSaveState({ started: false });
      }
    }, 250),
    []
  );

  const onResize = useCallback(
    debounce(() => {
      updateViewportSizeKey(`${window.innerHeight}.${window.innerWidth}`);
    }, 100)
  );

  useEffect(() => {
    document.onselectionchange = onSelectionChange;
    window.onresize = onResize;

    return () => {
      document.onselectionchange = () => {};
      window.onresize = () => {};
    };
  }, []);

  /**
   * If the selection is from bottom to top, the following is preferable, but does not support click to highlight very well:
   * 
   selection.anchorNode &&
    selection.focusNode &&
    (selection.anchorNode.parentElement.offsetTop <
    selection.focusNode.parentElement.offsetTop
      ? selection.anchorNode
      : selection.focusNode)
   */
  const upperSelectionNode = selection.anchorNode;

  const onSave = useCallback(() => {
    updateTextSelectionSaveState({ started: true });
    jsonFetcher("/api/text-selection", {
      method: "POST",
      body: JSON.stringify({
        itemId,
        text: selection.text,
      }),
    })
      .then((res) => {
        updateTextSelectionSaveState({
          started: false,
          success: true,
          data: res,
        });
      })
      .catch((error) => {
        updateTextSelectionSaveState({
          started: false,
          error,
        });
      });
  }, [selection, itemId]);

  return (
    <div>
      {error && (
        <div className="color-red">
          Something went wrong. Try refreshing the page.
        </div>
      )}
      {data ? (
        <div>
          <h2>{data.metaTitle || data.title}</h2>
          <h3>{data.metaDescription}</h3>
          {hostname && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{hostname}</span>
              <a href={url}>Original</a>
            </div>
          )}
          <br />
          <hr />
          <br />
          <div
            className="rendered-html-body"
            dangerouslySetInnerHTML={{ __html: data.body }}
          />
          {upperSelectionNode && (
            <div
              key={viewportSizeKey}
              style={{
                position: "absolute",
                height: 100,
                width: 160,
                background: "var(--c1)",
                color: "var(--c3)",
                borderRadius: 4,
                top: upperSelectionNode.parentElement.offsetTop - (100 + 8),
                left: Math.round(0.5 * window.innerWidth) - 80,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 8,
                flexDirection: "column",
              }}
            >
              <div className="p-all-1">
                <small>
                  <b>{selection.text.length}</b> characters
                </small>
              </div>
              <div>
                {selection.text && selection.text.length > 0 && (
                  <>
                    {!textSelectionSaveState.started &&
                      !textSelectionSaveState.success && (
                        <button onClick={onSave}>Save 🗄</button>
                      )}
                    {textSelectionSaveState.success && <span>Success ✨</span>}
                    {textSelectionSaveState.error && <span>Error ❌</span>}
                  </>
                )}
              </div>
              <style jsx>{`
                button {
                  background: var(--c3);
                  color: var(--c1);
                  padding: 0.4em 0.6em;
                }
              `}</style>
            </div>
          )}
        </div>
      ) : (
        renderPlaceholder()
      )}
    </div>
  );
};
export default Data;
