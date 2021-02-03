import { useState, useEffect } from "react";
import {
  getResultObject,
  usePaginatedContentList,
} from "../../lib/usePaginatedContentList";
import LoadingItem from "../loading/LoadingItem";
import ContentListPages from "./contentListPages";

const useContentPages = ({ sortOrder }) => {
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

  const onLoadMore = () => {
    updateCursor(getResultObject(data.data).after);
  };

  const hasMore = data && typeof getResultObject(data.data).after === "string";

  return {
    pages: (data || pages.length > 0) && pages,
    hasMore,
    onLoadMore,
    isValidating,
    error,
  };
};

const ContentList = ({ sortOrder }) => {
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