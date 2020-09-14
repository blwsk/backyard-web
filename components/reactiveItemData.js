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

const Content = ({ hostname, data, url }) => {
  if (!data || !data.content) {
    return <p>Loading...</p>;
  }

  if (hostname === "twitter.com") {
    return <TweetEmbed url={url} />;
  }

  if (hostname === "youtube.com" || hostname === "www.youtube.com") {
    return <YouTubeEmbed url={url} />;
  }

  return (
    <div
      className="rendered-html-body"
      dangerouslySetInnerHTML={{ __html: data.content.body }}
    />
  );
};

const H2 = ({ data }) => {
  if (!data || !data.content) {
    return <h2>Loading...</h2>;
  }
  return <h2>{data.content.metaTitle || data.content.title}</h2>;
};

const H3 = ({ data }) => {
  if (!data || !data.content) {
    return <h3>Loading...</h3>;
  }
  return <h3>{data.content.metaDescription}</h3>;
};

const Metadata = ({
  hostname,
  url,
  data,
  onShowContent,
  onShowClips,
  showClips,
}) => {
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
          onClick={data ? onShowContent : undefined}
        >
          Content {!showClips && "👀"}
        </button>
        <button className="small blue" onClick={data ? onShowClips : undefined}>
          Clips {showClips && "👀"}
        </button>
      </span>
    </div>
  );
};

const ReactiveItemData = ({ url, itemId, clips, invalidateQuery }) => {
  const { data, error } = useSWR(
    /**
     * The /api/item-content endpoint does not currently use the ?id param,
     * but it is useful for ensuring that SWR does not show cached result for
     * other items, since just the key argument is used as cache key
     */
    `/api/item-content?id=${itemId}`,
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
        <H2 data={data} />
        <H3 data={data} />
        {hostname && (
          <Metadata
            hostname={hostname}
            url={url}
            data={data}
            onShowContent={onShowContent}
            onShowClips={onShowClips}
            showClips={showClips}
          />
        )}
        <hr style={{ margin: "24px 0px 48px 0" }} />
        {!showClips ? (
          <>
            <Content data={data} hostname={hostname} url={url} />
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
