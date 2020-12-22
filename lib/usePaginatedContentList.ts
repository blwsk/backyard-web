import gql from "gql-tag";
import { useAuthedSWR } from "./requestHooks";
import { gqlFetcherFactory } from "./fetcherFactories";

export const PAGE_LENGTH = 100;

export const sortOrderEnum = {
  ascending: "ascending",
  descending: "descending",
};

export const getResultObject = (result) =>
  // the first two correspond to real GQL response paths
  result.itemsByUser ||
  result.itemsByUserReverse ||
  // this last one is a shim to support Algolia search results with the same components
  result.searchResults;

export const buildQuery = ({ cursorValue, sortOrder }) => {
  switch (sortOrder) {
    case sortOrderEnum.ascending:
      return gql`
          query ItemsByUser($userId: String!) {
            itemsByUser(userId: $userId, _size: ${PAGE_LENGTH}, _cursor: ${cursorValue}) {
              data {
                url
                _id
                _ts
                content {
                  title
                  json
                }
                origin {
                  rssEntryContent
                }
                source
              }
              before
              after
            }
          }
        `;
    case sortOrderEnum.descending:
    default:
      return gql`
          query ItemsByUserReverse($userId: String!) {
            itemsByUserReverse(userId: $userId, _size: ${PAGE_LENGTH}, _cursor: ${cursorValue}) {
              data {
                url
                _id
                _ts
                content {
                  title
                  json
                }
                origin {
                  rssEntryContent
                }
                source
              }
              before
              after
            }
          }
        `;
  }
};

export const usePaginatedContentList = ({
  cursor,
  sortOrder = sortOrderEnum.descending,
}) => {
  const cursorValue = cursor ? `"${cursor}"` : cursor;

  const query = buildQuery({
    cursorValue,
    sortOrder,
  });

  const { data, error, isValidating } = useAuthedSWR(query, gqlFetcherFactory);

  return {
    data,
    error,
    isValidating,
  };
};
