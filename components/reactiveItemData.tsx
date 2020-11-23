import { useState, useEffect } from "react";
import sanitize from "sanitize-html";

import { getHostname } from "../lib/urls";
import Selection from "./selection";
import ItemContent from "./itemContent";
import ItemControls, { Button } from "./itemControls";
import { ItemContent as ItemContentType } from "../types/ItemTypes";
import { Clip } from "../types/ClipTypes";
import { useAuthedSWR } from "../lib/requestHooks";
import { jsonFetcherFactory } from "../lib/fetcherFactories";
import SelectList from "./selectList";
import Wrapper from "./wrapper";
import { getParsedOriginEmail } from "../lib/getParsedOriginEmail";

type CurentType = "content" | "clips" | "email" | "more";

const ClipsList = ({ clips }: { clips: Clip[] }) => {
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

const OriginalEmail = ({ originEmailBody }) => {
  const [mounted, updateMounted] = useState(true);
  const [iframe, updateIframe] = useState<HTMLIFrameElement>();

  useEffect(() => {
    if (iframe) {
      iframe.contentDocument.querySelectorAll("a").forEach((a) => {
        a.target = "_blank";
      });
    }
    return () => updateMounted(false);
  }, [iframe]);

  return (
    <>
      <div className="iframe-wrapper w-full rounded border border-solid border-black">
        <iframe
          ref={(el) => {
            setTimeout(() => mounted && updateIframe(el));
          }}
          srcDoc={originEmailBody}
          width="100%"
          height="100%"
        />
      </div>
      <style jsx>{`
        .iframe-wrapper {
          background: white;
          height: 50vh;
        }
      `}</style>
    </>
  );
};

const EmailSandbox = ({ originEmailBody, itemId, invalidateQuery }) => {
  const html = getParsedOriginEmail(originEmailBody);

  const [showParsed, updateShowParsed] = useState(!!html);

  return (
    <div>
      {!!html && (
        <div className="flex mb-4">
          <Button
            current={showParsed}
            onClick={() => updateShowParsed(true)}
            first
          >
            Parsed
          </Button>
          <Button
            current={!showParsed}
            onClick={() => updateShowParsed(false)}
            last
          >
            Original
          </Button>
        </div>
      )}
      {showParsed ? (
        <>
          <div
            className="rendered-html-body"
            dangerouslySetInnerHTML={{ __html: sanitize(html) }}
          />
          <Selection itemId={itemId} invalidateQuery={invalidateQuery} />
        </>
      ) : (
        <OriginalEmail originEmailBody={originEmailBody} />
      )}
    </div>
  );
};

const MoreOptions = ({ itemId }) => {
  return (
    <Wrapper nested>
      <div className="well mb-4">
        <h4>Add to a list</h4>
        <SelectList inline ids={[itemId]} />
      </div>
    </Wrapper>
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
      <span>
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

const ReactiveItemData = ({
  url,
  itemId,
  clips,
  invalidateQuery,
  content,
  originEmailBody,
}: {
  url: string;
  itemId: string;
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
        <div className="my-4">
          <H2 data={data} content={content} />
          <H3 data={data} content={content} />
        </div>
        {hostname && (
          <div className="my-4">
            <ItemControls
              current={current}
              updateCurrent={updateCurrent}
              originEmailBody={originEmailBody}
            />
          </div>
        )}
        {current === "content" && (
          <>
            <ItemContent data={data} content={content} url={url} />
            <Selection itemId={itemId} invalidateQuery={invalidateQuery} />
          </>
        )}
        {current === "clips" && <ClipsList clips={clips} />}
        {current === "email" && (
          <EmailSandbox
            originEmailBody={originEmailBody}
            itemId={itemId}
            invalidateQuery={invalidateQuery}
          />
        )}
        {current === "more" && <MoreOptions itemId={itemId} />}
      </div>
    </div>
  );
};

export default ReactiveItemData;
