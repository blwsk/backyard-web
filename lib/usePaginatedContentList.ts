import gql from "gql-tag";
import { useGraphql } from "./requestHooks";

export const PAGE_LENGTH = 20;

export const sortOrderEnum = {
  ascending: "ASC",
  descending: "DESC",
};

export type SortOrder = "ASC" | "DESC";

export const getResultObject = (result) =>
  // modern api
  result.items ||
  // this last one is a shim to support Algolia search results with the same components
  result.searchResults;

export const usePaginatedContentList = ({
  cursor,
  sortOrder = "DESC",
}: {
  cursor?: string;
  sortOrder: SortOrder;
}) => {
  const { data, error, isValidating } = useGraphql<any>({
    query: gql`
      query($size: Int, $cursor: ID, $userId: String!, $sortOrder: SortOrder!) {
        items(
          size: $size
          cursor: $cursor
          userId: $userId
          sortOrder: $sortOrder
        ) {
          results {
            url
            createdAt
            createdBy
            content {
              title
              json
            }
            origin {
              rssFeedUrl
            }
            id
            source
            legacyId
          }
          next
        }
      }
    `,
    variables: {
      size: PAGE_LENGTH,
      cursor: cursor ? cursor : undefined,
      sortOrder,
      // userId will be provided in the serverless function
    },
  });

  return {
    data,
    error,
    isValidating,
  };
};
