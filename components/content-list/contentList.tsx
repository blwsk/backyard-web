import { useState, useEffect } from "react";
import {
  getResultObject,
  SortOrder,
  usePaginatedContentList,
} from "../../lib/usePaginatedContentList";
import { ItemPreview } from "../../types/ItemTypes";
import LoadingItem from "../loading/LoadingItem";
import ContentListPages from "./contentListPages";

const useContentPages = ({ sortOrder }: { sortOrder: SortOrder }) => {
  const [cursor, updateCursor] = useState<string>(null);

  const [pages, updatesPages] = useState([]);

  const {
    data: paginatedContentListData,
    error,
    isValidating,
  } = usePaginatedContentList({
    cursor,
    sortOrder,
  });

  useEffect(() => {
    if (paginatedContentListData && pages.length === 0) {
      /**
       * First page
       */
      updatesPages([paginatedContentListData]);
      return;
    }

    if (
      paginatedContentListData &&
      !isValidating &&
      typeof cursor === "string"
    ) {
      /**
       * Subsequent pages
       */
      updatesPages([...pages, paginatedContentListData]);
      return;
    }
  }, [paginatedContentListData, cursor]);

  const onLoadMore = () => {
    updateCursor(getResultObject(paginatedContentListData).next);
  };

  const hasMore =
    paginatedContentListData &&
    typeof getResultObject(paginatedContentListData).next === "string";

  return {
    pages: (paginatedContentListData || pages.length > 0 ? pages : []) as {
      results: ItemPreview[];
    }[],
    hasMore,
    onLoadMore,
    isValidating,
    error,
  };
};

const ContentList = ({ sortOrder }: { sortOrder: SortOrder }) => {
  const { pages, hasMore, onLoadMore, isValidating, error } = useContentPages({
    sortOrder,
  });

  return (
    <div style={{ paddingBottom: 80 }}>
      {pages && (
        <ContentListPages
          pages={pages}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          isValidating={isValidating}
        />
      )}
      {isValidating && <LoadingItem />}
      {error && <div className="text-red-500">Oops. Refresh the page.</div>}
    </div>
  );
};

export default ContentList;
