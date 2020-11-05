import useSWR from "swr";
import { getHostname } from "../lib/urls";
import { useState } from "react";
import Selection from "./selection";
import SelectList from "./selectList";
import ItemContent from "./itemContent";

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
  return <h3 className="line-clamp-3">{contentObj.metaDescription}</h3>;
};

const Metadata = ({ hostname, url }) => {
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
  itemId,
}) => {
  const [showSelectList, updateShowSelectList] = useState(false);
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
        <button
          className={`small secondary ${showSelectList ? "current" : ""}`}
          onClick={() => {
            updateShowSelectList(!showSelectList);
          }}
        >
          More
        </button>
      </div>
      {showSelectList && (
        <div className="p-y-2">
          <SelectList inline ids={[itemId]} />
        </div>
      )}
      <style jsx>{`
        div {
          display: flex;
          flex-direction: row;
        }
        button {
          margin: 0;
          margin-right: 8px;
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
      if (content && (content.body || content.json)) {
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
    },
    { revalidateOnFocus: false }
  );

  const [showClips, updateShowClips] = useState(false);

  const onShowClips = () => updateShowClips(true);
  const onShowContent = () => updateShowClips(false);

  const { hostname } = getHostname(url);

  return (
    <div>
      {error && (
        <div className="color-red">
          Something went wrong. Try refreshing the page.
        </div>
      )}
      <div>
        {hostname && <Metadata hostname={hostname} url={url} />}
        <div className="m-y-6">
          <H2 data={data} content={content} />
          <H3 data={data} content={content} />
        </div>
        {hostname && (
          <div className="m-y-6">
            <Controls
              data={data}
              content={content}
              onShowContent={onShowContent}
              onShowClips={onShowClips}
              showClips={showClips}
              itemId={itemId}
            />
          </div>
        )}
        {!showClips ? (
          <>
            <ItemContent data={data} content={content} url={url} />
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
