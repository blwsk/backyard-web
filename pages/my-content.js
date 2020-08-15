import Link from "next/link";
import gql from "gql-tag";
import useSWR from "swr";
import { gqlFetcher } from "../lib/fetcher";
import Header from "../components/header";
import { stripParams } from "../lib/urls";
import Wrapper from "../components/wrapper";
import { useState, useCallback, useRef, useEffect } from "react";

const PAGE_LENGTH = 20;

const ContentPage = ({ items }) => {
  return (
    <div>
      {items.map((item) => {
        const { _id, _ts, url } = item;

        const encodedUrl = encodeURI(url);
        const withParamsStripped = stripParams(url);

        const date = new Date(_ts / 1000);
        const dateString = date.toDateString();
        const timeString = date.toLocaleTimeString();

        return (
          <div key={_id} className="p-y-2">
            <Link href={`/viewer?url=${encodedUrl}`}>
              <a>{withParamsStripped}</a>
            </Link>
            <div>
              <small>
                <span>{dateString}</span>
                <span>・</span>
                <span>{timeString}</span>
              </small>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MyContent = () => {
  const [cursor, updateCursor] = useState(null);

  const [pages, updatesPages] = useState([]);

  const cursorValue = cursor ? `"${cursor}"` : cursor;

  const { data, error, isValidating } = useSWR(
    gql`
      query {
        allItems(_size: ${PAGE_LENGTH}, _cursor: ${cursorValue}) {
          data {
            url
            _id
            _ts
          }
          before
          after
        }
      }
    `,
    gqlFetcher
  );

  /***
   *
   *
   * We need to render Page elements for each page
   *
   *
   */

  useEffect(() => {
    if (pages.length === 0 && data) {
      /**
       * First page
       */
      updatesPages([data.data]);
      return;
    }

    if (data && !isValidating && typeof cursor === "string") {
      /**
       * Subsequent pages
       */
      updatesPages([...pages, data.data]);
      return;
    }
  }, [data, cursor]);

  const onLoadMoreClick = useCallback(() => {
    updateCursor(data.data.allItems.after);
  });

  const isLoading = !data && isValidating;

  const hasMore = data && typeof data.data.allItems.after === "string";

  return (
    <div>
      <Header />
      <Wrapper>
        <div
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            wordBreak: "break-word",
          }}
        >
          <h1>My Content</h1>
        </div>
        <div>
          {pages.map((result) => (
            <ContentPage
              key={`before.${result.allItems.before}`}
              items={result.allItems.data}
            />
          ))}
          {data &&
            !isValidating &&
            (hasMore ? (
              <div>
                <br />
                <button onClick={onLoadMoreClick}>Load more</button>
              </div>
            ) : (
              <div>
                <br />
                <div>All caught up.</div>
              </div>
            ))}
        </div>
        {isValidating && <h2>Loading...</h2>}
        {error && <div style={{ color: "red" }}>Oops. Refresh the page.</div>}
      </Wrapper>
    </div>
  );
};

export default MyContent;
