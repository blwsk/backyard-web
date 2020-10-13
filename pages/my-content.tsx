import { mutate } from "swr";
import Header from "../components/header";
import Wrapper from "../components/wrapper";
import { useState, useCallback, useEffect } from "react";
import { withRouter } from "next/router";
import ListItem from "../components/listItem";
import SelectList, { listQuery } from "../components/selectList";
import { capitalize } from "../lib/capitalize";
import requireAuth from "../lib/requireAuth";
import { useAuthedCallback } from "../lib/requestHooks";
import { jsonFetcherFactory } from "../lib/fetcherFactories";
import {
  sortOrderEnum,
  getResultObject,
  usePaginatedContentList,
} from "../lib/usePaginatedContentList";
import { getHostname } from "../lib/urls";

const colors = [
  "c62828",
  "AD1457",
  "6A1B9A",
  "4527A0",
  "283593",
  "1565C0",
  "0277BD",
  "00838F",
  "00695C",
  "2E7D32",
  "558B2F",
  "9E9D24",
  "F9A825",
  "FF8F00",
  "EF6C00",
  "D84315",
  "4E342E",
  "424242",
  "37474F",
];

const getColorFromString = (str) => {
  if (!str) return null;

  const numLetters = 26;
  const charCode = str.charCodeAt(0);
  const relative = 122 - charCode; // 122 is the char code for `z`
  const numColors = colors.length;
  const selectedColor = colors[Math.floor(relative / (numLetters / numColors))];

  return `#${selectedColor}`;
};

const ContentPageItem = ({
  item,
  checked,
  onChange,
  disabled,
  backgroundColor = undefined,
}) => {
  const { _id, url } = item;

  return (
    <>
      <div
        className="content-item"
        key={_id}
        style={{
          backgroundColor:
            backgroundColor ||
            getColorFromString(getHostname(url).hostname.replace("www.", "")),
        }}
      >
        <ListItem item={item} light />
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <style jsx>
        {`
          .content-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 4px;
            margin-bottom: 8px;
            padding: 16px;
          }
          .content-item input[type="checkbox"] {
            height: 20px;
            width: 20px;
            cursor: pointer;
            margin-left: 16px;
          }
        `}
      </style>
    </>
  );
};

const LoadingItem = () => (
  <ContentPageItem
    item={{
      _id: 0,
      _ts: Date.now(),
      url: "https://loading.com",
      content: {
        title: "Loading...",
      },
    }}
    checked={false}
    onChange={() => {}}
    disabled={true}
    backgroundColor="var(--c4)"
  />
);

const ContentPage = ({
  items,
  onSelect,
  onDeselect,
  selectionState,
  deletedIds,
}) => {
  return (
    <div>
      {items.map((item) => {
        const { _id } = item;
        const isDeleted = deletedIds.indexOf(_id) > -1;

        if (isDeleted) {
          return <div key={_id} />;
        }

        const checked = !!selectionState[_id];

        return (
          <ContentPageItem
            item={item}
            key={_id}
            disabled={false}
            checked={checked}
            onChange={(e) => {
              if (e.target.checked) {
                onSelect(_id);
              } else {
                onDeselect(_id);
              }
            }}
          />
        );
      })}
    </div>
  );
};

const CreateList = () => {
  const [listName, updateListName] = useState("");
  const onChange = (e) => {
    updateListName(e.target.value);
  };
  const [createState, updateCreateState] = useState({
    started: false,
    response: null,
    error: null,
  });

  const doCreateList = useAuthedCallback(
    "/api/create-list",
    {
      method: "POST",
      body: JSON.stringify({ name: listName }),
    },
    jsonFetcherFactory
  );

  const onCreateList = () => {
    updateCreateState({ started: true, response: null, error: null });

    doCreateList()
      .then((response) => {
        updateCreateState({ started: false, response, error: null });
        mutate(listQuery);
        updateListName("");
      })
      .catch((error) => {
        updateCreateState({ started: false, response: null, error });
      });
  };

  return (
    <div>
      {createState.started === false ? (
        <input
          type="text"
          value={listName}
          placeholder="List name"
          onChange={onChange}
          style={{ width: 200 }}
        />
      ) : (
        <span>Loading...</span>
      )}
      <button onClick={onCreateList} disabled={createState.started}>
        Create
      </button>
      <style jsx>{`
        button {
          background: rgb(55, 55, 55);
          color: white;
        }
      `}</style>
    </div>
  );
};

const ContentPageList = ({ pages, hasMore, onLoadMore, isValidating }) => {
  const [selectionState, updateSelectionState] = useState({});

  const onSelect = (id) => {
    const temp = Object.assign({}, selectionState, {
      [id]: true,
    });
    updateSelectionState(temp);
  };
  const onDeselect = (id) => {
    const temp = Object.assign({}, selectionState);
    delete temp[id];
    updateSelectionState(temp);
  };
  const onClearSelection = () => {
    updateSelectionState({});
  };

  const numSelected = Object.keys(selectionState).length;

  const [deletionState, updateDeletionState] = useState({
    pending: false,
    started: false,
    success: false,
    res: null,
    error: null,
  });

  const [addToListState, updateAddToListState] = useState({
    pending: false,
    started: false,
    success: false,
    res: null,
    error: null,
  });

  const onClickDelete = () => {
    updateDeletionState({
      pending: true,
      started: false,
      success: false,
      res: null,
      error: null,
    });
  };

  const onCancelPendingDelete = () => {
    updateDeletionState({
      pending: false,
      started: false,
      success: false,
      res: null,
      error: null,
    });
  };

  const [deletedIds, updateDeletedIds] = useState([]);

  const ids = Object.keys(selectionState);

  const doDeleteItems = useAuthedCallback(
    "/api/delete-items",
    {
      method: "DELETE",
      body: JSON.stringify(ids),
    },
    jsonFetcherFactory
  );

  const onConfirmDelete = () => {
    updateDeletionState({
      started: true,
      pending: false,
      success: false,
      res: null,
      error: null,
    });

    doDeleteItems()
      .then((res) => {
        updateDeletionState({
          pending: false,
          started: false,
          success: true,
          res,
          error: null,
        });

        onClearSelection();

        updateDeletedIds([...deletedIds, ...ids]);
      })
      .catch((error) => {
        updateDeletionState({
          pending: false,
          started: false,
          success: false,
          error,
          res: null,
        });
      });
  };

  const onClickAddToList = () => {
    updateAddToListState({
      pending: true,
      started: false,
      success: false,
      error: null,
      res: null,
    });
  };

  const onCancelPendingAddToList = () => {
    updateAddToListState({
      pending: false,
      started: false,
      success: false,
      error: null,
      res: null,
    });
  };

  const hasLoadedAtleastFirstPage = pages.length > 0;

  return (
    <div>
      {pages.map((result) => (
        <ContentPage
          key={`before.${getResultObject(result).before}`}
          items={getResultObject(result).data}
          onSelect={onSelect}
          onDeselect={onDeselect}
          selectionState={selectionState}
          deletedIds={deletedIds}
        />
      ))}
      {hasLoadedAtleastFirstPage && (
        <>
          {hasMore ? (
            <button onClick={onLoadMore}>Load more</button>
          ) : (
            !isValidating && <div>No more content.</div>
          )}
        </>
      )}
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
              height: 100,
            }}
          >
            <div style={{ color: "black", textAlign: "center", paddingTop: 8 }}>
              <div>
                <b style={{ fontWeight: 500 }}>
                  You&apos;ve selected <span>{numSelected}</span>{" "}
                  <span>{numSelected === 1 ? "item" : "items"}</span>
                </b>
              </div>
              <div>
                <button onClick={onClickDelete}>Delete</button>
                <button onClick={onClickAddToList}>Add to list</button>
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
            {deletionState.started ? (
              <div>Progress...</div>
            ) : (
              <div>
                <button className="primary" onClick={onConfirmDelete}>
                  Yes. Delete.
                </button>
                <button onClick={onCancelPendingDelete}>Nope. Cancel.</button>
              </div>
            )}
            {deletionState.error && (
              <div className="error">Oops. Something went wrong.</div>
            )}
          </div>
        )}
        {addToListState.pending && (
          <div className="pending-modal p-all-4">
            <h2>
              Add <span>{numSelected}</span>{" "}
              <span>{numSelected === 1 ? "item" : "items"}</span> to list
            </h2>
            {addToListState.started ? (
              <div>Progress...</div>
            ) : (
              <div>
                <h4>Select a list</h4>
                <SelectList ids={Object.keys(selectionState)} />
                <br />
                <h4>Create a new list</h4>
                <CreateList />
                <br />
                <div>
                  <button onClick={onCancelPendingAddToList}>
                    Nope. Cancel.
                  </button>
                </div>
              </div>
            )}
            {addToListState.error && (
              <div className="error">Oops. Something went wrong.</div>
            )}
          </div>
        )}
        <style jsx>{`
          button {
            background: rgb(55, 55, 55);
            color: white;
          }
          button.primary {
            background: purple;
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
          .error {
            color: red;
            background-color: white;
          }
        `}</style>
      </div>
    </div>
  );
};

const MyContent = ({ sortOrder }) => {
  const [cursor, updateCursor] = useState(null);

  const [pages, updatesPages] = useState([]);

  const { data, error, isValidating } = usePaginatedContentList({
    cursor,
    sortOrder,
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

  const onLoadMoreClick = () => {
    updateCursor(getResultObject(data.data).after);
  };

  const hasMore = data && typeof getResultObject(data.data).after === "string";

  return (
    <>
      <div style={{ paddingBottom: 80 }}>
        {(data || pages.length > 0) && (
          <ContentPageList
            pages={pages}
            hasMore={hasMore}
            onLoadMore={onLoadMoreClick}
            isValidating={isValidating}
          />
        )}
        {isValidating && <LoadingItem />}
      </div>
      {error && <div style={{ color: "red" }}>Oops. Refresh the page.</div>}
    </>
  );
};

const ListControls = ({ sortOrder, onChangeSortOrder }) => {
  return (
    <div>
      <span className="control">
        <select id="sort" onChange={onChangeSortOrder} value={sortOrder}>
          {Object.keys(sortOrderEnum).map((key) => (
            <option key={key} value={key}>
              {capitalize(key)}
            </option>
          ))}
        </select>
      </span>
      <span className="control">
        <select id="filter" onChange={onChangeSortOrder} value={sortOrder}>
          {Object.keys(sortOrderEnum).map((key) => (
            <option key={key} value={key}>
              {capitalize(key)}
            </option>
          ))}
        </select>
      </span>
      <style jsx>{`
        .control {
          margin-right: 16px;
        }
        .control:last-of-type {
          margin-right: 0;
        }
      `}</style>
    </div>
  );
};

const WrappedMyContent = ({ router }) => {
  const sortOrder = router.query.sort || sortOrderEnum.descending;

  const onChangeSortOrder = (e) => {
    router.push(`/my-content?sort=${e.target.value}`);
  };

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
          <h1>Saved</h1>
          <ListControls
            sortOrder={sortOrder}
            onChangeSortOrder={onChangeSortOrder}
          />
        </div>
        <MyContent key={sortOrder} sortOrder={sortOrder} />
      </Wrapper>
    </div>
  );
};

export default requireAuth(withRouter(WrappedMyContent));