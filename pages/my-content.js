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

const ContentPage = ({ items, onSelect, onDeselect, selectionState }) => {
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
          <div
            key={_id}
            className="p-y-3"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Link href={{ pathname: "/viewer", query: { url: encodedUrl } }}>
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
            <input
              type="checkbox"
              checked={!!selectionState[_id]}
              onChange={(e) => {
                if (e.target.checked) {
                  onSelect(_id);
                } else {
                  onDeselect(_id);
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

const ContentPageList = ({ pages }) => {
  const [selectionState, updateSelectionState] = useState({});

  const onSelect = useCallback((id) => {
    const temp = Object.assign({}, selectionState, {
      [id]: true,
    });
    updateSelectionState(temp);
  });
  const onDeselect = useCallback((id) => {
    const temp = Object.assign({}, selectionState);
    delete temp[id];
    updateSelectionState(temp);
  });
  const onClearSelection = useCallback(() => {
    updateSelectionState({});
  });

  const numSelected = Object.keys(selectionState).length;

  const [deletionState, updateDeletionState] = useState({
    pending: false,
  });

  const onClickDelete = useCallback(() => {
    updateDeletionState({
      pending: true,
    });
  });

  const onCancelPendingDelete = useCallback(() => {
    updateDeletionState({
      pending: false,
    });
  });

  return (
    <div>
      {pages.map((result) => (
        <ContentPage
          key={`before.${getResultObject(result).before}`}
          items={getResultObject(result).data}
          onSelect={onSelect}
          onDeselect={onDeselect}
          selectionState={selectionState}
        />
      ))}
      <div>
        {numSelected > 0 && (
          <footer
            style={{
              background: "pink",
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              width: "100%",
              height: 80,
            }}
          >
            <div style={{ color: "black", textAlign: "center", paddingTop: 8 }}>
              <div>
                <b style={{ fontWeight: 500 }}>
                  You've selected <span>{numSelected}</span>{" "}
                  <span>{numSelected === 1 ? "item" : "items"}</span>
                </b>
              </div>
              <div>
                <button onClick={onClickDelete}>Delete</button>
                <button onClick={onClearSelection}>Clear</button>
              </div>
            </div>
          </footer>
        )}
        {deletionState.pending && (
          <div className="pending-modal p-all-4">
            <h2>
              Are you sure you want to delete <span>{numSelected}</span>{" "}
              <span>{numSelected === 1 ? "item" : "items"}</span>?
            </h2>
            <div>
              <button>Yes. Delete.</button>
              <button onClick={onCancelPendingDelete}>Nope. Cancel.</button>
            </div>
          </div>
        )}
        <style jsx>{`
          button {
            background: black;
            color: white;
          }
          .pending-modal {
            background: teal;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 100%;

            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          h2 {
            text-align: center;
          }
        `}</style>
      </div>
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
      <div style={{ paddingBottom: 80 }}>
        <ContentPageList pages={pages} />
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
