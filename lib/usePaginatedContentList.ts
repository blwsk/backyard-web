import gql from "gql-tag";
import { Item } from "../types/ItemTypes";
import { useGraphql } from "./requestHooks";

export const PAGE_LENGTH = 20;

export const sortOrderEnum = {
  ascending: "ASC",
  descending: "DESC",
};

export type SortOrder = "ASC" | "DESC";

export interface PaginatedContentList {
  items: {
    results: Item[];
    next?: string;
  };
}

export interface SearchResultsContentList {
  searchResults: {
    results: Item[];
    next?: string;
  };
}

export const getResultObject = (
  result: PaginatedContentList | SearchResultsContentList
) => {
  let pageResults = result as PaginatedContentList;
  let searchResults = result as SearchResultsContentList;

  if (pageResults.items) {
    return pageResults.items;
  }

  // this last one is a shim to support Algolia search results with the same components
  return searchResults.searchResults;
};

export const usePaginatedContentList = ({
  cursor,
  sortOrder = "DESC",
  pageLength = PAGE_LENGTH,
}: {
  cursor?: string;
  sortOrder: SortOrder;
  pageLength?: number;
}): {
  data?: PaginatedContentList;
  error?: Error;
  isValidating: boolean;
} => {
  const { data, error, isValidating } = useGraphql<{
    data: PaginatedContentList;
  }>({
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
      size: pageLength,
      cursor: cursor ? cursor : undefined,
      sortOrder,
      // userId will be provided in the serverless function
    },
  });

  return {
    data: data ? data.data : null,
    error,
    isValidating,
  };
};
