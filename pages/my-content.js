import Link from "next/link";
import gql from "gql-tag";
import { mutate } from "swr";
import Header from "../components/header";
import Wrapper from "../components/wrapper";
import { useState, useCallback, useEffect } from "react";
import { withRouter } from "next/router";
import ListItem from "../components/listItem";
import { capitalize } from "../lib/capitalize";
import requireAuth from "../lib/requireAuth";
import { useAuthedSWR, useAuthedCallback } from "../lib/requestHooks";
import { gqlFetcherFactory, jsonFetcherFactory } from "../lib/fetcherFactories";

const PAGE_LENGTH = 20;

const sortOrderEnum = {
  ascending: "ascending",
  descending: "descending",
};

const listQuery = gql`
  query {
    allLists {
      data {
        name
        _id
        _ts
      }
    }
  }
`;

const getResultObject = (result) =>
  result.allItems || result.allItemsReverseChrono;

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

  const { data, error, isValidating } = useAuthedSWR(query, gqlFetcherFactory);

  return {
    data,
    error,
    isValidating,
  };
};

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

        return (
          <div
            key={_id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ListItem item={item} />
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

const SelectList = ({ selectionState }) => {
  const [selectedListId, updateSelectedListId] = useState();
  const { data, error, isValidating } = useAuthedSWR(
    listQuery,
    gqlFetcherFactory
  );

  const lists = data && data.data.allLists.data.sort((a, b) => b._ts - a._ts);

  useEffect(() => {
    if (lists && lists.length > 0) {
      updateSelectedListId(lists[0]._id);
    }
  }, [lists]);

  const onSelectList = useCallback((e) => {
    const id = e.target.value;
    updateSelectedListId(id);
  });

  const [createListItemState, updateCreateListItemState] = useState({
    started: false,
  });

  const doCreateListItem = useAuthedCallback(
    "/api/list-items",
    {
      method: "POST",
      body: JSON.stringify({
        ids: Object.keys(selectionState),
        listId: selectedListId,
      }),
    },
    jsonFetcherFactory
  );

  const onCreateListItem = useCallback(() => {
    /**
     * Do state updates based on request status
     */
    updateCreateListItemState({
      started: true,
    });

    doCreateListItem()
      .then((result) => {
        updateCreateListItemState({
          started: false,
          result,
        });
      })
      .catch((error) => {
        updateCreateListItemState({
          started: false,
          error,
        });
      });
  });

  return (
    <div>
      <select
        style={{ width: 200 }}
        value={selectedListId}
        onChange={onSelectList}
      >
        {lists
          ? lists.map((list) => {
              return (
                <option key={list._id} value={list._id}>
                  {list.name}
                </option>
              );
            })
          : null}
      </select>
      {!lists ||
        (isValidating && <span style={{ marginLeft: 8 }}>Loading...</span>)}
      <div>
        <br />
        <div>
          <button
            onClick={onCreateListItem}
            disabled={
              !selectedListId ||
              typeof selectedListId !== "string" ||
              createListItemState.started
            }
          >
            Add
          </button>
          {createListItemState.started ? (
            <span>Adding...</span>
          ) : (
            createListItemState.result &&
            typeof selectedListId === "string" && (
              <Link
                href={{ pathname: "/lists", query: { id: selectedListId } }}
              >
                <a>View list</a>
              </Link>
            )
          )}
        </div>
      </div>
      <style jsx>{`
        button {
          background: purple;
          color: white;
        }
        button:disabled {
          cursor: auto;
          background: gray;
        }
        a {
          color: black;
        }
      `}</style>
    </div>
  );
};

const CreateList = () => {
  const [listName, updateListName] = useState("");
  const onChange = useCallback((e) => {
    updateListName(e.target.value);
  });
  const [createState, updateCreateState] = useState({ started: false });

  const doCreateList = useAuthedCallback(
    gql`
      mutation {
        createList(
          data: {
            name: "${listName}"
          }
        ) {
          name
          _id
          _ts
        }
      }
    `,
    {},
    gqlFetcherFactory
  );

  const onCreateList = useCallback(() => {
    updateCreateState({ started: true });

    doCreateList()
      .then((response) => {
        updateCreateState({ started: false, response });
        mutate(listQuery);
        updateListName("");
      })
      .catch((error) => {
        updateCreateState({ started: false, error });
      });
  });

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

  const [addToListState, updateAddToListState] = useState({
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

  const [deletedIds, updateDeletedIds] = useState([]);

  const ids = Object.keys(selectionState);

  const doDeleteItems = useAuthedCallback(
    "/api/items",
    {
      method: "DELETE",
      body: JSON.stringify(ids),
    },
    jsonFetcherFactory
  );

  const onConfirmDelete = useCallback(() => {
    updateDeletionState({
      started: true,
    });

    doDeleteItems()
      .then((res) => {
        updateDeletionState({
          pending: false,
          started: false,
          success: true,
          res,
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
        });
      });
  });

  const onClickAddToList = useCallback(() => {
    updateAddToListState({
      pending: true,
    });
  });

  const onCancelPendingAddToList = useCallback(() => {
    updateAddToListState({
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
          deletedIds={deletedIds}
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
                <SelectList selectionState={selectionState} />
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

  const cursorValue = cursor ? `"${cursor}"` : cursor;

  const { data, error, isValidating } = usePaginatedContent({
    cursorValue,
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

  const onLoadMoreClick = useCallback(() => {
    updateCursor(getResultObject(data.data).after);
  });

  const hasMore = data && typeof getResultObject(data.data).after === "string";

  return (
    <>
      <div style={{ paddingBottom: 80 }}>
        <ContentPageList pages={pages} />
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
        </div>
      </div>
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
          <h1>Saved</h1>
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

export default requireAuth(withRouter(WrappedMyContent));
