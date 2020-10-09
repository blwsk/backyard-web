import Header from "../components/header";
import Wrapper from "../components/wrapper";
import gql from "gql-tag";
import ListItem from "../components/listItem";
import { useState, useCallback, useEffect } from "react";
import requireAuth from "../lib/requireAuth";
import { useAuthedSWR } from "../lib/requestHooks";
import { gqlFetcherFactory } from "../lib/fetcherFactories";

const PAGE_LENGTH = 100;

const getResultObject = (result) => result.clipsByUser;

const Clip = ({ item, text, _id }) => {
  return (
    <div key={_id} className="selection-item">
      {item && <ListItem item={item} />}
      <blockquote>{text}</blockquote>
    </div>
  );
};

const Page = ({ pageData }) => {
  return (
    <>
      {pageData.map((pageItem) => {
        const { item, text, _id } = pageItem;

        return <Clip key={_id} item={item} text={text} id={_id} />;
      })}
    </>
  );
};

const PageList = ({ pages }) => {
  return (
    <>
      {pages.map((page) => {
        const { data: pageData, before } = getResultObject(page);

        return <Page key={before} pageData={pageData} />;
      })}
    </>
  );
};

const usePaginatedContent = ({ cursorValue }) => {
  const { data, error, isValidating } = useAuthedSWR(
    gql`
      query ClipsByUser($userId: String!) {
        clipsByUser(userId: $userId, _size: ${PAGE_LENGTH}, _cursor: ${cursorValue}) {
          data {
            item {
              url
              _id
              _ts
            }
            text
            _id
          }
          before
          after
        }
      }
    `,
    gqlFetcherFactory
  );

  return {
    data,
    error,
    isValidating,
  };
};

const SelectionList = () => {
  const [cursor, updateCursor] = useState(null);

  const [pages, updatesPages] = useState([]);

  const cursorValue = cursor ? `"${cursor}"` : cursor;

  const { data, error, isValidating } = usePaginatedContent({
    cursorValue,
  });

  const onLoadMoreClick = useCallback(() => {
    updateCursor(getResultObject(data.data).after);
  });

  useEffect(() => {
    if (data && getResultObject(data.data).before === null) {
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

  const hasMore = data && typeof getResultObject(data.data).after === "string";

  return (
    <div>
      <PageList pages={pages} />
      <div style={{ height: 100 }}>
        {data ? (
          hasMore ? (
            <div>
              <br />
              <button onClick={onLoadMoreClick}>Load more</button>
            </div>
          ) : (
            <div>
              <br />
              <div>All caught up.</div>
            </div>
          )
        ) : (
          <div>
            <br />
            <div>Loading...</div>
          </div>
        )}
        {error && <div>{JSON.stringify(error)}</div>}
      </div>
    </div>
  );
};

const Clips = () => {
  return (
    <div>
      <Header />
      <Wrapper>
        <h1>Clips</h1>
        <SelectionList />
      </Wrapper>
      <style jsx global>{`
        .selection-item {
          margin-bottom: 16px;
        }
        .selection-item:last-of-type {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default requireAuth(Clips);
