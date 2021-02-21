import { useState } from "react";
import { getHostname } from "../lib/urls";
import Selection from "./selection";
import ItemContent from "./itemContent";
import ItemControls from "./itemControls";
import {
  EmailJson,
  isEmailJson,
  ItemContent as ItemContentType,
} from "../types/ItemTypes";
import { Clip } from "../types/ClipTypes";
import { useAuthedSWR } from "../lib/requestHooks";
import { jsonFetcherFactory } from "../lib/fetcherFactories";

import Icon from "./ui/Icon";
import ErrorBoundary from "./errorBoundary";
import { useCopy } from "../lib/useCopy";
import { classNames } from "../lib/classNames";
import EmailSandbox from "./emailSandbox";
import EmailHeader from "./emailHeader";

type CurentType = "content" | "clips" | "email";

const ClipsList = ({ clips }: { clips: Clip[] }) => {
  return (
    <>
      {clips && clips.length > 0 ? (
        <ul>
          {clips.map(({ text, id }) => (
            <li key={id}>
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

const Metadata = ({ hostname, url }: { hostname: string; url: string }) => {
  const { copy, showCopied } = useCopy();

  return (
    <>
      <span className="flex items-center space-x-4">
        <a href={`//${hostname}`}>{hostname}</a>
        <span className="flex items-center space-x-2">
          <a href={url}>Original</a>
          <small>
            <span
              title="Copy"
              className={classNames("cursor-pointer", {
                "text-green-500": showCopied,
              })}
              onClick={() => copy(url)}
            >
              <Icon name="copy" size="md" />
            </span>
          </small>
        </span>
      </span>
      <style jsx>{`
        span {
          display: flex;
          justify-content: flex-start;
        }
      `}</style>
    </>
  );
};

const ItemDataHeader = ({
  hostname,
  url,
  data,
  content,
  current,
  updateCurrent,
  originEmailBody,
}: {
  hostname?: string;
  url?: string;
  data?: any;
  content: ItemContentType;
  originEmailBody?: string;
  current: CurentType;
  updateCurrent: (next: CurentType) => void;
}) => {
  let metadataElements = (
    <>
      {hostname && <Metadata hostname={hostname} url={url} />}
      <div className="my-4">
        <H2 data={data} content={content} />
        <H3 data={data} content={content} />
      </div>
    </>
  );

  if (content && content.json && isEmailJson(content.json)) {
    metadataElements = <EmailHeader emailJson={content.json as EmailJson} />;
  }

  return (
    <>
      {metadataElements}
      <div className="my-4">
        <ItemControls
          current={current}
          updateCurrent={updateCurrent}
          originEmailBody={originEmailBody}
        />
      </div>
    </>
  );
};

const ReactiveItemData = ({
  url,
  itemId,
  modernItemId,
  clips,
  invalidateQuery,
  content,
  originEmailBody,
}: {
  url?: string;
  itemId: string;
  modernItemId: string;
  clips: Clip[];
  invalidateQuery(): void;
  content: ItemContentType;
  originEmailBody?: string;
}) => {
  const { data, error } = useAuthedSWR(
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
    jsonFetcherFactory,
    {
      method: "PUT",
      body: JSON.stringify({
        url,
        id: itemId,
      }),
      revalidateOnFocus: false,
    }
  );

  const [current, updateCurrent] = useState<CurentType>("content");

  const hostname = url && getHostname(url) ? getHostname(url) : undefined;

  return (
    <div>
      {error && (
        <div className="color-red">
          Something went wrong. Try refreshing the page.
        </div>
      )}
      <div>
        <ErrorBoundary>
          <ItemDataHeader
            hostname={hostname}
            url={url}
            data={data}
            content={content}
            current={current}
            updateCurrent={updateCurrent}
            originEmailBody={originEmailBody}
          />
          {current === "content" && (
            <div className="relative">
              <ItemContent
                data={data}
                content={content}
                url={url}
                originEmailBody={originEmailBody}
                itemId={itemId}
                modernItemId={modernItemId}
                invalidateQuery={invalidateQuery}
              />
              <Selection
                itemId={itemId}
                modernItemId={modernItemId}
                invalidateQuery={invalidateQuery}
              />
            </div>
          )}
          {current === "clips" && <ClipsList clips={clips} />}
          {current === "email" && (
            <EmailSandbox
              originEmailBody={originEmailBody}
              itemId={itemId}
              modernItemId={modernItemId}
              invalidateQuery={invalidateQuery}
            />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default ReactiveItemData;
