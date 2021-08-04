import { FunctionComponent } from "react";
import { ItemPreview } from "../../types/ItemTypes";
import ContentListPages from "./contentListPages";

const SearchResults: FunctionComponent<{ results: ItemPreview[] }> = ({
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
            itemPreviews: {
              results,
              next: null,
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
