import algoliasearch from "algoliasearch";
import authedEndpoint from "../../api-utils/authedEndpoint";
import { doAsyncThing } from "../../api-utils/doAsyncThing";
import { indexes } from "../../types/SearchIndexTypes";

const { ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY } = process.env;

const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);

const search = authedEndpoint(async (req, res, { user }) => {
  const indexName: string | string[] = req.query.index;

  if (
    !indexName ||
    typeof indexName !== "string" ||
    indexes.indexOf(indexName) === -1
  ) {
    res.status(400).send({
      message:
        "Expected query parameter, ?index=<index name string>, but none was provided.",
    });
    return;
  }

  let searchQuery;

  try {
    const body = JSON.parse(req.body);
    searchQuery = body.query;
  } catch (error) {
    void error;
  }

  if (!searchQuery || typeof searchQuery !== "string") {
    res.status(400).send({
      message:
        "Expected request body with query string, e.g. { query: 'search term' }, but none was provided.",
    });
    return;
  }

  const [searchResult, searchError] = await doAsyncThing(async () => {
    const index = algoliaClient.initIndex(indexName);

    return index.search(searchQuery, {
      hitsPerPage: 50,
      facetFilters: `createdBy:${user.sub}`,
    });
  });

  if (searchError) {
    res.status(500).send({
      message: "Search error",
      error: searchError,
    });
    return;
  }

  const transformedResult = searchResult.hits.map((hit) => {
    return {
      ...hit,
      legacyId: hit._id,
      createdAt: hit._ts ? hit._ts / 1000 : hit._ts,
    };
  });

  res.status(200).send(transformedResult);
});

export default search;
