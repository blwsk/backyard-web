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
  onFocus?(): void;
  onBlur?(): void;
  onError?(error: Error): void;
};

const SearchInput: FunctionComponent<Props> = ({
  onSearch,
  onFocus,
  onBlur,
  onError,
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
      <input
        type="text"
        placeholder="search"
        value={query}
        onChange={(e) => updateQuery(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {error && !onError && <span className="m-left-2">{"❌ Error"}</span>}
    </>
  );
};

export default SearchInput;
