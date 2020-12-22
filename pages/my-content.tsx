import { useState } from "react";
import { withRouter } from "next/router";
import Header from "../components/header";
import Wrapper from "../components/wrapper";
import SearchResults from "../components/content-list/searchResults";
import ContentList from "../components/content-list/contentList";
import ListControls from "../components/content-list/listControls";
import requireAuth from "../lib/requireAuth";
import { sortOrderEnum } from "../lib/usePaginatedContentList";

const WrappedMyContent = ({ router }) => {
  const [isSearching, updateIsSearching] = useState(false);
  const [searchResults, updateSearchResults] = useState(null);

  const {
    query: { sort, search },
  } = router;

  const sortOrder = sort || sortOrderEnum.descending;

  const searchQuery = search || "";

  const onChangeSortOrder = (e) => {
    router.push({
      pathname: "/my-content",
      query: { ...router.query, sort: e.target.value },
    });
  };

  const onClearSearchQuery = () => {
    const nextQuery = Object.assign({}, router.query);
    delete nextQuery.search;

    router.push({
      pathname: "/my-content",
      query: nextQuery,
    });

    updateSearchResults(null);
  };

  const isSearchMode = isSearching || searchResults;

  return (
    <div>
      <Header />
      <Wrapper className="pb-0">
        <h1>Saved</h1>
        <ListControls
          sortOrder={sortOrder}
          onChangeSortOrder={onChangeSortOrder}
          onSearch={(results) => {
            updateSearchResults(results);
          }}
          onSearchToggle={(isSearching) => updateIsSearching(isSearching)}
          onClear={onClearSearchQuery}
          isSearchMode={isSearchMode}
          searchQuery={searchQuery}
        />
      </Wrapper>
      <Wrapper flush>
        {isSearchMode ? (
          <SearchResults results={searchResults} />
        ) : (
          <ContentList key={sortOrder} sortOrder={sortOrder} />
        )}
      </Wrapper>
    </div>
  );
};

export default requireAuth(withRouter(WrappedMyContent));
