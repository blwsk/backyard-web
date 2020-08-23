import useSWR from "swr";
import { jsonParser } from "../lib/fetcher";
import { getHostname } from "../lib/urls";
import { useEffect, useCallback, useState } from "react";
import { debounce } from "../lib/debounce";

export const fetcher = (path, options) => {
  return fetch(path, options).then(jsonParser);
};

const Data = ({ url, rawUrl, renderPlaceholder }) => {
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
        });
      } else {
        updateSelection({
          text: null,
          htmlChunk: null,
          anchorNode: null,
        });
      }
    }),
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
  }, []);

  useEffect(() => {
    console.log(selection);
  }, [selection]);

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
          {selection.anchorNode && (
            <div
              key={viewportSizeKey}
              style={{
                position: "absolute",
                height: 200,
                width: 200,
                background: "black",
                color: "white",
                borderRadius: 4,
                top: selection.anchorNode.parentElement.offsetTop - (200 + 8),
                left:
                  selection.anchorNode.parentElement.offsetLeft +
                  Math.round(
                    0.5 * selection.anchorNode.parentElement.offsetWidth
                  ) -
                  100,
                display: "flex",
                justifyContent: "center",
                overflow: "auto",
                padding: 8,
              }}
            >
              {selection.text}
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
