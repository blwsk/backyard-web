import { useState } from "react";
import { useAuthedCallback } from "../../lib/requestHooks";
import { jsonFetcherFactory } from "../../lib/fetcherFactories";
import { getResultObject } from "../../lib/usePaginatedContentList";
import ContentPageItem from "../contentPageItem";
import Button from "../ui/Button";
import Checkbox from "../ui/Checkbox";

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
              <Checkbox
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

const SelectionControls = ({
  deletionState,
  numSelected,
  onCancelPendingDelete,
  onClearSelection,
  onClickDelete,
  onConfirmDelete,
}) => {
  return (
    <div>
      {numSelected > 0 && (
        <footer
          className="bg-gray-300 fixed w-full inset-x-0 bottom-0"
          style={{
            height: 100,
          }}
        >
          <div className="text-black text-center pt-3">
            <div className="mb-1">
              <b className="font-medium">
                You&apos;ve selected <span>{numSelected}</span>{" "}
                <span>{numSelected === 1 ? "item" : "items"}</span>
              </b>
            </div>
            <div>
              <Button onClick={onClickDelete}>Delete</Button>
              <Button onClick={onClearSelection} variant="secondary">
                Clear
              </Button>
            </div>
          </div>
        </footer>
      )}
      {deletionState.pending && (
        <div className="pending-modal bg-gray-300 p-4">
          <h2>
            Are you sure you want to delete <span>{numSelected}</span>{" "}
            <span>{numSelected === 1 ? "item" : "items"}</span>?
          </h2>
          {deletionState.started ? (
            <div>Progress...</div>
          ) : (
            <div>
              <Button onClick={onConfirmDelete}>Yes. Delete.</Button>
              <Button onClick={onCancelPendingDelete} variant="secondary">
                Nope. Cancel.
              </Button>
            </div>
          )}
          {deletionState.error && (
            <div className="error">Oops. Something went wrong.</div>
          )}
        </div>
      )}
      <style jsx>{`
        .pending-modal {
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
  );
};

const ContentListPages = ({ pages, hasMore, onLoadMore, isValidating }) => {
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
              <Button onClick={onLoadMore}>Load more</Button>
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
      <SelectionControls
        deletionState={deletionState}
        numSelected={numSelected}
        onCancelPendingDelete={onCancelPendingDelete}
        onClearSelection={onClearSelection}
        onClickDelete={onClickDelete}
        onConfirmDelete={onConfirmDelete}
      />
    </div>
  );
};

export default ContentListPages;
