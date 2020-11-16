import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { useAuthedSWR, useAuthedCallback } from "../lib/requestHooks";
import { gqlFetcherFactory, jsonFetcherFactory } from "../lib/fetcherFactories";
import gql from "gql-tag";

export const listQuery = gql`
  query ListsByUser($userId: String!) {
    listsByUser(userId: $userId) {
      data {
        name
        _id
        _ts
      }
    }
  }
`;

const SelectList = ({ ids, inline = false }) => {
  const [selectedListId, updateSelectedListId] = useState();
  const { data, error, isValidating } = useAuthedSWR(
    listQuery,
    gqlFetcherFactory
  );

  const lists =
    data && data.data.listsByUser.data.sort((a, b) => b._ts - a._ts);

  useEffect(() => {
    if (lists && lists.length > 0) {
      updateSelectedListId(lists[0]._id);
    }
  }, [lists]);

  const onSelectList = (e) => {
    const id = e.target.value;
    updateSelectedListId(id);
  };

  const [createListItemState, updateCreateListItemState] = useState({
    started: false,
    error: null,
    result: null,
  });

  const doCreateListItem = useAuthedCallback(
    "/api/create-list-items",
    {
      method: "POST",
      body: JSON.stringify({
        ids,
        listId: selectedListId,
      }),
    },
    jsonFetcherFactory
  );

  const onCreateListItem = () => {
    /**
     * Do state updates based on request status
     */
    updateCreateListItemState({
      started: true,
      error: null,
      result: null,
    });

    doCreateListItem()
      .then((result) => {
        updateCreateListItemState({
          started: false,
          result,
          error: null,
        });
      })
      .catch((error) => {
        updateCreateListItemState({
          started: false,
          error,
          result: null,
        });
      });
  };

  return (
    <div className="flex items-center">
      <select
        className="form-select cursor-pointer"
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
      {!lists || isValidating ? (
        <span style={{ marginLeft: 8 }}>Loading...</span>
      ) : (
        <span>
          {!inline && <br />}
          <span>
            <button
              className="m-0 ml-2"
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
          </span>
        </span>
      )}
    </div>
  );
};

export default SelectList;
