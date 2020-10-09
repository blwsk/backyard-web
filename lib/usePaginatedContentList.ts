import gql from "gql-tag";
import { useAuthedSWR } from "./requestHooks";
import { gqlFetcherFactory } from "./fetcherFactories";

export const PAGE_LENGTH = 100;

export const sortOrderEnum = {
  ascending: "ascending",
  descending: "descending",
  popular: "popular",
};

export const getResultObject = (result) =>
  result.itemsByUser ||
  result.itemsByUserReverse ||
  result.mostPopularItemsByUser;

export const buildQuery = ({ cursorValue, sortOrder }) => {
  switch (sortOrder) {
    case sortOrderEnum.popular:
      return gql`
          query MostPopularItemsByUser($userId: String!) {
            mostPopularItemsByUser(userId: $userId, _size: ${PAGE_LENGTH}, _cursor: ${cursorValue}) {
              data {
                url
                _id
                _ts
                content {
                  title
                }
              }
              before
              after
            }
          }
        `;
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
                }
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
                }
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
