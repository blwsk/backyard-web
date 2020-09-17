import useSWR from "swr";
import { getHostname } from "../lib/urls";
import { useCallback, useState } from "react";
import TweetEmbed from "./tweetEmbed";
import YouTubeEmbed from "./youTubeEmbed";
import Selection from "./selection";

const ClipsList = ({ clips }) => {
  return (
    <>
      {clips && clips.length > 0 ? (
        <ul>
          {clips.map(({ text, _id }) => (
            <li key={_id}>
              <blockquote>{text}</blockquote>
            </li>
          ))}
        </ul>
      ) : (
        <div>No clips. Save one!</div>
      )}
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

const Content = ({ hostname, data, url, content }) => {
  if (hostname === "twitter.com") {
    return <TweetEmbed url={url} />;
  }

  if (hostname === "youtube.com" || hostname === "www.youtube.com") {
    return <YouTubeEmbed url={url} />;
  }

  const body =
    (data && data.content && data.content.body) || (content && content.body);

  if (!body) {
    return <p>Loading...</p>;
  }

  return (
    <div
      className="rendered-html-body"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
};

const H2 = ({ data, content }) => {
  const contentObj = (data && data.content && data.content) || content;

  if (!contentObj) {
    return <h2>Loading...</h2>;
  }
  return <h2>{contentObj.metaTitle || contentObj.title}</h2>;
};

const H3 = ({ data, content }) => {
  const contentObj = (data && data.content && data.content) || content;

  if (!contentObj) {
    return <h3>Loading...</h3>;
  }
  return <h3>{contentObj.metaDescription}</h3>;
};

const Metadata = ({ hostname, url, data, content }) => {
  const loaded = data || content;

  return (
    <>
      <span
        style={{
          marginBottom: 24,
          opacity: 0.8,
        }}
      >
        <a href={`//${hostname}`}>{hostname}</a>
        <a href={url}>Original</a>
      </span>
      <style jsx>{`
        span {
          display: flex;
          justify-content: flex-start;
        }
        span a {
          margin-right: 16px;
        }
        @media (max-width: 600px) {
          span {
            justify-content: space-between;
          }
        }
      `}</style>
    </>
  );
};

const Controls = ({
  onShowContent,
  onShowClips,
  showClips,
  content,
  data,
  url,
}) => {
  const loaded = data || content;

  return (
    <>
      <div
        style={{
          marginTop: 16,
        }}
      >
        <button
          className={`small secondary ${!showClips ? "current" : ""}`}
          onClick={loaded ? onShowContent : undefined}
        >
          Content
        </button>
        <button
          className={`small secondary ${showClips ? "current" : ""}`}
          onClick={loaded ? onShowClips : undefined}
        >
          Clips
        </button>
      </div>
      <style jsx>{`
        div {
          display: flex;
          flex-direction: row;
        }
        button {
          margin: 0;
          margin-right: 8px;
        }
        @media (max-width: 600px) {
          div {
            flex-direction: row-reverse;
          }

          button {
            margin: 0;
            margin-left: 8px;
          }
        }
      `}</style>
    </>
  );
};

const ReactiveItemData = ({ url, itemId, clips, invalidateQuery, content }) => {
  const { data, error } = useSWR(
    /**
     * The /api/item-content endpoint does not currently use the ?id param,
     * but it is useful for ensuring that SWR does not show cached result for
     * other items, since just the key argument is used as cache key
     */
    () => {
      /**
       * If content is pre-fetched, skip fetching it again
       */
      if (content) {
        throw new Error("skip fetch");
      }
      return `/api/item-content?id=${itemId}`;
    },
    (path) => {
      return fetch(path, {
        method: "PUT",

        body: JSON.stringify({
          url,
          id: itemId,
        }),
      }).then((res) => res.json());
    }
  );

  const [showClips, updateShowClips] = useState(false);

  const onShowClips = useCallback(() => updateShowClips(true));
  const onShowContent = useCallback(() => updateShowClips(false));

  const { hostname } = getHostname(url);

  return (
    <div>
      {error && (
        <div className="color-red">
          Something went wrong. Try refreshing the page.
        </div>
      )}
      <div>
        {hostname && (
          <Metadata
            hostname={hostname}
            url={url}
            data={data}
            content={content}
            onShowContent={onShowContent}
            onShowClips={onShowClips}
            showClips={showClips}
          />
        )}
        <div
          style={{
            marginTop: 24,
            marginBottom: 24,
          }}
        >
          <H2 data={data} content={content} />
          <H3 data={data} content={content} />
        </div>
        {hostname && (
          <Controls
            hostname={hostname}
            url={url}
            data={data}
            content={content}
            onShowContent={onShowContent}
            onShowClips={onShowClips}
            showClips={showClips}
          />
        )}
        {!showClips ? (
          <>
            <Content
              data={data}
              content={content}
              hostname={hostname}
              url={url}
            />
            <Selection itemId={itemId} invalidateQuery={invalidateQuery} />
          </>
        ) : (
          <ClipsList clips={clips} />
        )}
      </div>
    </div>
  );
};

export default ReactiveItemData;
