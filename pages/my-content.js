import Link from "next/link";
import gql from "gql-tag";
import useSWR from "swr";
import { gqlFetcher } from "../lib/fetcher";
import Header from "../components/header";
import { stripParams } from "../lib/urls";
import Wrapper from "../components/wrapper";
import { useState, useCallback, useEffect } from "react";
import { withRouter } from "next/router";

const PAGE_LENGTH = 20;

const sortOrderEnum = {
  ascending: "ascending",
  descending: "descending",
};

const getResultObject = (result) =>
  result.allItems || result.allItemsReverseChrono;

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  const l = s.toLowerCase();
  return l.charAt(0).toUpperCase() + l.slice(1);
};

const usePaginatedContent = ({
  cursorValue,
  sortOrder = sortOrderEnum.descending,
}) => {
  const query =
    sortOrder === sortOrderEnum.ascending
      ? gql`
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
        `
      : gql`
          query {
            allItemsReverseChrono(_size: ${PAGE_LENGTH}, _cursor: ${cursorValue}) {
              data {
                url
                _id
                _ts
              }
              before
              after
            }
          }
        `;

  const { data, error, isValidating } = useSWR(query, gqlFetcher);

  return {
    data,
    error,
    isValidating,
  };
};

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

const MyContent = ({ sortOrder }) => {
  const [cursor, updateCursor] = useState(null);

  const [pages, updatesPages] = useState([]);

  const cursorValue = cursor ? `"${cursor}"` : cursor;

  const { data, error, isValidating } = usePaginatedContent({
    cursorValue,
    sortOrder,
  });

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
    updateCursor(getResultObject(data.data).after);
  });

  const hasMore = data && typeof getResultObject(data.data).after === "string";

  return (
    <>
      <div>
        {pages.map((result) => (
          <ContentPage
            key={`before.${getResultObject(result).before}`}
            items={getResultObject(result).data}
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
    </>
  );
};

const WrappedMyContent = ({ router }) => {
  const sortOrder = router.query.sort || sortOrderEnum.descending;

  const onChangeSortOrder = useCallback((e) => {
    router.push(`/my-content?sort=${e.target.value}`);
  });

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
          <div>
            <label style={{ marginRight: 8 }}>Sort:</label>
            <select onChange={onChangeSortOrder} value={sortOrder}>
              {Object.keys(sortOrderEnum).map((key) => (
                <option key={key} value={key}>
                  {capitalize(key)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <MyContent key={sortOrder} sortOrder={sortOrder} />
      </Wrapper>
    </div>
  );
};

export default withRouter(WrappedMyContent);
