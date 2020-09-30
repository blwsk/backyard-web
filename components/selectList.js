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

  const onSelectList = useCallback((e) => {
    const id = e.target.value;
    updateSelectedListId(id);
  });

  const [createListItemState, updateCreateListItemState] = useState({
    started: false,
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
      {!lists || isValidating ? (
        <span style={{ marginLeft: 8 }}>Loading...</span>
      ) : (
        <span>
          {!inline && <br />}
          <span>
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
          </span>
        </span>
      )}
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

export default SelectList;