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

const Metadata = ({
  hostname,
  url,
  data,
  onShowContent,
  onShowClips,
  showClips,
  content,
}) => {
  const loaded = data || content;

  return (
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
        <button
          className="small blue"
          onClick={loaded ? onShowContent : undefined}
        >
          Content {!showClips && "👀"}
        </button>
        <button
          className="small blue"
          onClick={loaded ? onShowClips : undefined}
        >
          Clips {showClips && "👀"}
        </button>
      </span>
    </div>
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
        <H2 data={data} content={content} />
        <H3 data={data} content={content} />
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
        <hr style={{ margin: "24px 0px 48px 0" }} />
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
