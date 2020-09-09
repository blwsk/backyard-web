import useSWR from "swr";
import { getHostname } from "../lib/urls";
import { useEffect, useCallback, useState } from "react";
import { withRouter } from "next/router";
import { debounce } from "../lib/debounce";
import Link from "next/link";
import gql from "gql-tag";
import TweetEmbed from "./tweetEmbed";
import YouTubeEmbed from "./youTubeEmbed";
import { useAuthedSWR, useAuthedCallback } from "../lib/requestHooks";
import { gqlFetcherFactory, jsonFetcherFactory } from "../lib/fetcherFactories";

function isiOs() {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

export const fetcher = (path, options) => {
  return fetch(path, options).then((res) => res.json());
};

const ContentBody = ({ hostname, data, url }) => {
  if (hostname === "twitter.com") {
    return <TweetEmbed url={url} />;
  }

  if (hostname === "youtube.com" || hostname === "www.youtube.com") {
    return <YouTubeEmbed url={url} />;
  }

  return (
    <div
      className="rendered-html-body"
      dangerouslySetInnerHTML={{ __html: data.body }}
    />
  );
};

const ClipsList = ({ clips }) => {
  return (
    <>
      <ul>
        {clips.map(({ text, _id }) => (
          <li key={_id}>
            <blockquote>{text}</blockquote>
          </li>
        ))}
      </ul>
      <style jsx>{`
        ul {
          padding-left: 0;
        }
        li {
          list-style-type: none;
          margin-bottom: 12px;
        }
      `}</style>
    </>
  );
};

const ReactiveItemData = ({
  url,
  rawUrl,
  renderPlaceholder,
  itemId,
  clips,
}) => {
  const { data, error } = useSWR(
    `https://backyard-data.vercel.app/api/index?url=${rawUrl}&id=${itemId}`,
    // `http://localhost:3001/api/index?url=${rawUrl}`,
    fetcher
  );

  const [showClips, updateShowClips] = useState(false);

  const onShowClips = useCallback(() => updateShowClips(true));
  const onShowContent = useCallback(() => updateShowClips(false));

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

  const doTextSelection = useAuthedCallback(
    "/api/create-text-selection",
    {
      method: "POST",
      body: JSON.stringify({
        itemId,
        text: selection.text,
      }),
    },
    jsonFetcherFactory
  );

  const onSave = useCallback(() => {
    updateTextSelectionSaveState({ started: true });

    doTextSelection()
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                <a href={`//${hostname}`}>{hostname}</a>
                {" ・ "}
                <a href={url}>Original</a>
              </span>
              <span className="button-group">
                <button className="small blue" onClick={onShowContent}>
                  Content {!showClips && "👀"}
                </button>
                <button className="small blue" onClick={onShowClips}>
                  Clips {showClips && "👀"}
                </button>
              </span>
            </div>
          )}
          <br />
          <hr />
          <br />
          {!showClips ? (
            <>
              <ContentBody data={data} hostname={hostname} url={url} />
              {upperSelectionNode && (
                <div
                  key={viewportSizeKey}
                  style={{
                    background: "var(--c1)",
                    color: "var(--c3)",
                    borderRadius: 8,

                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 8,
                    flexDirection: "column",
                    ...(isiOs()
                      ? {
                          position: "sticky",
                          bottom: 16,
                          width: "100%",
                          borderRadius: 8,
                          height: 100,
                        }
                      : {
                          position: "absolute",
                          height: 100,
                          width: 200,
                          top:
                            upperSelectionNode.parentElement.offsetTop -
                            (100 + 8),
                          left: Math.round(0.5 * window.innerWidth) - 100,
                        }),
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
                        {textSelectionSaveState.success && (
                          <div>
                            <span style={{ marginRight: 8 }}>Success</span>
                            <Link href="/clips">
                              <button>View</button>
                            </Link>
                          </div>
                        )}
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
            </>
          ) : (
            <ClipsList clips={clips} />
          )}
        </div>
      ) : (
        renderPlaceholder()
      )}
    </div>
  );
};

const Data = ({ itemId }) => {
  const { data, error, isValidating } = useAuthedSWR(
    gql`
     query {
      findItemByID(id: ${itemId}) {
        url
      }
      clipsByItemId(itemId: "${itemId}") {
        data {
          text
          _id
        }
      }
    }
  `,
    gqlFetcherFactory
  );

  if (!data) {
    return <div>Loading...</div>;
  }

  const url = data.data.findItemByID.url;
  const rawUrl = encodeURI(url);

  const clips = data.data.clipsByItemId.data;

  return (
    <>
      <ReactiveItemData
        url={url}
        rawUrl={rawUrl}
        renderPlaceholder={() => (
          <div style={{ wordBreak: "break-word" }}>
            <h2>{url}</h2>
          </div>
        )}
        itemId={itemId}
        clips={clips}
      />
    </>
  );
};

export default Data;
