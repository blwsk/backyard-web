import React, {
  useState,
  useEffect,
  useCallback,
  FunctionComponent,
} from "react";
import { useAuthedCallback } from "../lib/requestHooks";
import { jsonFetcherFactory } from "../lib/fetcherFactories";
import { throttle } from "../lib/throttle";
import { SearchIndex } from "../types/SearchIndexTypes";
import TextInput from "./ui/TextInput";
import { ItemContent, ItemPreview } from "../types/ItemTypes";
import { getHostname } from "../lib/urls";

interface SearchResult {
  content: Partial<ItemContent>;
  createdAt: number;
  createdBy: string;
  legacyId: bigint;
  url?: string;
}

type Props = {
  defaultQuery?: string;
  index: SearchIndex;
  onBlur?(e): void;
  onClear?(): void;
  onError?(error: Error): void;
  onFocus?(e): void;
  onSearch(results: any[]): void;
};

const SearchInput: FunctionComponent<Props> = ({
  defaultQuery,
  index,
  onBlur,
  onClear,
  onError,
  onFocus,
  onSearch,
}) => {
  const [query, updateQuery] = useState("");

  const doSearch = useAuthedCallback(
    `/api/search?index=${index}`,
    {
      method: "PUT",
    },
    jsonFetcherFactory
  );

  const [results, updateResults] = useState(null);
  const [error, updateError] = useState(null);

  const wrappedDoSearch = useCallback(
    (options) =>
      doSearch(options)
        .then((res: SearchResult[]) => {
          const itemPreviews = res.map(
            (searchResult: SearchResult): ItemPreview => {
              return {
                id: Math.floor(Math.random() * Date.now()),
                legacyId: searchResult.legacyId,
                source: "manual",
                createdAt: searchResult.createdAt,
                createdBy: searchResult.createdBy,
                title: searchResult.content && searchResult.content.title,
                domain: searchResult.url && getHostname(searchResult.url),
              };
            }
          );

          updateResults(itemPreviews);
        })
        .catch((err) => {
          updateError(err);
        }),
    []
  );

  const doThrottledSearch = useCallback(throttle(wrappedDoSearch, 1000), []);

  useEffect(() => {
    if (defaultQuery) {
      updateQuery(defaultQuery);
    }
  }, [defaultQuery]);

  useEffect(() => {
    if (query.length > 2) {
      doThrottledSearch({
        body: JSON.stringify({
          query,
        }),
      });
    }
  }, [query]);

  useEffect(() => {
    if (results) {
      onSearch(results);
    }
  }, [results]);

  useEffect(() => {
    if (error) {
      if (onError) {
        onError(error);
      }
    }
  }, [error]);

  return (
    <div className="w-full">
      <span className="flex items-center">
        <TextInput
          className="w-full"
          placeholder="Search"
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          onFocus={onFocus}
          onBlur={(e) => {
            onBlur(e);
            if (query === "") {
              updateResults(null);
              updateError(null);

              if (onClear) {
                onClear();
              }
            }
          }}
        />
        {query && results && (
          <button
            className="m-0 ml-2 text-md px-4"
            onClick={() => {
              updateQuery("");
              updateResults(null);
              updateError(null);
              if (onClear) {
                onClear();
              }
            }}
          >
            ✕
          </button>
        )}
      </span>
      {error && !onError && <span className="m-left-2">{"❌ Error"}</span>}
    </div>
  );
};

export default SearchInput;
