import React, {
  useState,
  useEffect,
  useCallback,
  FunctionComponent,
} from "react";
import { useAuthedCallback } from "../lib/requestHooks";
import { jsonFetcherFactory } from "../lib/fetcherFactories";
import { throttle } from "../lib/throttle";

type Props = {
  onSearch(results: any[]): void;
  onFocus?(e): void;
  onBlur?(e): void;
  onError?(error: Error): void;
  onClear?(): void;
};

const SearchInput: FunctionComponent<Props> = ({
  onSearch,
  onFocus,
  onBlur,
  onError,
  onClear,
}) => {
  const [query, updateQuery] = useState("");

  const doSearch = useAuthedCallback(
    "/api/search",
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
        .then((res) => {
          updateResults(res);
        })
        .catch((err) => {
          updateError(err);
        }),
    []
  );

  const doThrottledSearch = useCallback(throttle(wrappedDoSearch, 1000), []);

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
    <>
      <span className="wrapper">
        <input
          type="text"
          placeholder="search"
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
            onClick={() => {
              updateQuery("");
              updateResults(null);
              updateError(null);
              if (onClear) {
                onClear();
              }
            }}
          >
            Clear
          </button>
        )}
      </span>
      {error && !onError && <span className="m-left-2">{"❌ Error"}</span>}
      <style jsx>{`
        .wrapper {
          width: 400px;
          max-width: 100%;
          display: inherit;
        }
        .wrapper input {
          flex-grow: 1;
        }
      `}</style>
    </>
  );
};

export default SearchInput;
