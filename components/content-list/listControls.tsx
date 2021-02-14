import { capitalize } from "../../lib/capitalize";
import { SortOrder, sortOrderEnum } from "../../lib/usePaginatedContentList";
import SearchInput from "../searchInput";
import { ITEMS } from "../../types/SearchIndexTypes";
import { classNames } from "../../lib/classNames";

const ListControls = ({
  sortOrder,
  onChangeSortOrder,
  onSearch,
  onSearchToggle,
  onClear,
  isSearchMode,
  searchQuery,
}: {
  sortOrder: SortOrder;
  onChangeSortOrder: (sortOrder: SortOrder) => void;
  onSearch: (results: any[]) => void;
  onSearchToggle: (search: boolean) => void;
  onClear: () => void;
  isSearchMode: boolean;
  searchQuery: string;
}) => {
  return (
    <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
      <select
        className={classNames(
          "form-select bg-gray-100 dark:bg-gray-900 dark:border-gray-900",
          {
            "cursor-pointer": !isSearchMode,
          }
        )}
        id="sort"
        onChange={(nextSortOrder: unknown) =>
          onChangeSortOrder(nextSortOrder as SortOrder)
        }
        value={isSearchMode ? "relevancy" : sortOrder}
        disabled={isSearchMode}
        title={
          isSearchMode ? "Search results are ordered by relevancy." : undefined
        }
      >
        {isSearchMode ? (
          <option key={"relevancy"} value={"relevancy"}>
            {capitalize("relevancy")}
          </option>
        ) : (
          Object.keys(sortOrderEnum).map((key) => (
            <option key={key} value={sortOrderEnum[key]}>
              {capitalize(key)}
            </option>
          ))
        )}
      </select>
      <SearchInput
        index={ITEMS}
        onSearch={onSearch}
        onFocus={() => {
          onSearchToggle(true);
        }}
        onBlur={() => {
          onSearchToggle(false);
        }}
        onClear={onClear}
        defaultQuery={searchQuery}
      />
    </div>
  );
};

export default ListControls;
