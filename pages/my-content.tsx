import Header from "../components/header";
import Wrapper from "../components/wrapper";
import { useState, useEffect, FunctionComponent } from "react";
import { withRouter } from "next/router";
import { capitalize } from "../lib/capitalize";
import requireAuth from "../lib/requireAuth";
import { useAuthedCallback } from "../lib/requestHooks";
import { jsonFetcherFactory } from "../lib/fetcherFactories";
import {
  sortOrderEnum,
  getResultObject,
  usePaginatedContentList,
} from "../lib/usePaginatedContentList";
import ContentPageItem from "../components/contentPageItem";
import SearchInput from "../components/searchInput";
import { ListItemProps } from "../components/listItem";
import { ITEMS } from "../types/SearchIndexTypes";
import LoadingItem from "../components/loading/LoadingItem";
import { classNames } from "../lib/classNames";

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
            renderCheckbox={() => (
              <input
                className="form-checkbox cursor-pointer"
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  if (e.target.checked) {
                    onSelect(_id);
                  } else {
                    onDeselect(_id);
                  }
                }}
                disabled={false}
              />
            )}
          />
        );
      })}
    </div>
  );
};

const useItemSelection = (initialState = {}) => {
  const [selectionState, updateSelectionState] = useState(initialState);

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

  return {
    selectionState,
    onSelect,
    onDeselect,
    onClearSelection,
  };
};

const useDeleteItems = (ids, onClearSelection) => {
  const [deletionState, updateDeletionState] = useState({
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

  return {
    deletionState,
    onClickDelete,
    onCancelPendingDelete,
    deletedIds,
    doDeleteItems,
    onConfirmDelete,
  };
};

const ContentPageList = ({ pages, hasMore, onLoadMore, isValidating }) => {
  const {
    selectionState,
    onSelect,
    onDeselect,
    onClearSelection,
  } = useItemSelection();

  const ids = Object.keys(selectionState);

  const {
    deletionState,
    deletedIds,
    onClickDelete,
    onCancelPendingDelete,
    onConfirmDelete,
  } = useDeleteItems(ids, onClearSelection);

  const numSelected = ids.length;

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
            <div className="flex justify-center items-center">
              <button onClick={onLoadMore}>Load more</button>
            </div>
          ) : (
            !isValidating && (
              <div className="flex justify-center items-center">
                <div className="font-semibold">No more content.</div>
              </div>
            )
          )}
        </>
      )}
      <div>
        {numSelected > 0 && (
          <footer
            className="bg-pink-400 fixed w-full inset-x-0 bottom-0"
            style={{
              height: 100,
            }}
          >
            <div className="text-black text-center pt-2">
              <div>
                <b className="font-medium">
                  You&apos;ve selected <span>{numSelected}</span>{" "}
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
          <div className="pending-modal p-4">
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
      {error && <div className="text-red-500">Oops. Refresh the page.</div>}
    </>
  );
};

const ListControls = ({
  sortOrder,
  onChangeSortOrder,
  onSearch,
  onSearchToggle,
  onClear,
  isSearchMode,
  searchQuery,
}) => {
  return (
    <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
      <select
        className={classNames("form-select", {
          "cursor-pointer": !isSearchMode,
        })}
        id="sort"
        onChange={onChangeSortOrder}
        value={isSearchMode ? "relevancy" : sortOrder}
        disabled={isSearchMode}
        title={
          isSearchMode ? "Search results are ordered by relevancy." : undefined
        }
      >
        {isSearchMode ? (
          <option key={"relevancy"} value={"relevancy"}>
            {capitalize("relevancy")}
          </option>
        ) : (
          Object.keys(sortOrderEnum).map((key) => (
            <option key={key} value={key}>
              {capitalize(key)}
            </option>
          ))
        )}
      </select>
      <SearchInput
        index={ITEMS}
        onSearch={onSearch}
        onFocus={() => {
          onSearchToggle(true);
        }}
        onBlur={() => {
          onSearchToggle(false);
        }}
        onClear={onClear}
        defaultQuery={searchQuery}
      />
    </div>
  );
};

const SearchResults: FunctionComponent<{ results: ListItemProps[] }> = ({
  results,
}) => {
  if (!results) {
    return (
      <div className="flex justify-center items-center">
        <div className="font-semibold">Enter a search term.</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex justify-center items-center">
        <div className="font-semibold">No results.</div>
      </div>
    );
  }

  return (
    <div>
      <ContentPageList
        pages={[
          {
            searchResults: {
              before: null,
              after: null,
              data: results,
            },
          },
        ]}
        hasMore={false}
        onLoadMore={() => {}}
        isValidating={false}
      />
    </div>
  );
};

const WrappedMyContent = ({ router }) => {
  const [isSearching, updateIsSearching] = useState(false);
  const [searchResults, updateSearchResults] = useState(null);

  const {
    query: { sort, search },
  } = router;

  const sortOrder = sort || sortOrderEnum.descending;

  const searchQuery = search || "";

  const onChangeSortOrder = (e) => {
    router.push({
      pathname: "/my-content",
      query: { ...router.query, sort: e.target.value },
    });
  };

  const isSearchMode = isSearching || searchResults;

  return (
    <div>
      <Header />
      <Wrapper className="pb-0">
        <h1>Saved</h1>
        <ListControls
          sortOrder={sortOrder}
          onChangeSortOrder={onChangeSortOrder}
          onSearch={(results) => {
            updateSearchResults(results);
          }}
          onSearchToggle={(isSearching) => updateIsSearching(isSearching)}
          onClear={() => {
            const nextQuery = Object.assign({}, router.query);
            delete nextQuery.search;

            router.push({
              pathname: "/my-content",
              query: nextQuery,
            });

            updateSearchResults(null);
          }}
          isSearchMode={isSearchMode}
          searchQuery={searchQuery}
        />
      </Wrapper>
      <Wrapper flush>
        {isSearchMode ? (
          <SearchResults results={searchResults} />
        ) : (
          <MyContent key={sortOrder} sortOrder={sortOrder} />
        )}
      </Wrapper>
    </div>
  );
};

export default requireAuth(withRouter(WrappedMyContent));
