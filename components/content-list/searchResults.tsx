import { FunctionComponent } from "react";
import { ListItemProps } from "../listItem";
import ContentListPages from "./contentListPages";

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
      <ContentListPages
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

export default SearchResults;
