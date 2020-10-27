import algoliasearch from "algoliasearch";
import authedEndpoint from "../../api-utils/authedEndpoint";
import { doAsyncThing } from "../../api-utils/doAsyncThing";

const { ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY } = process.env;

const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);

const INDEX_NAME = "backyard_test";

const index = algoliaClient.initIndex(INDEX_NAME);

const search = authedEndpoint(async (req, res) => {
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

  const [searchResult, searchError] = await doAsyncThing(() =>
    index.search(searchQuery, {
      hitsPerPage: 50,
    })
  );

  if (searchError) {
    res.status(500).send({
      message: "Search error",
      error: searchError,
    });
    return;
  }

  res.status(200).send(searchResult.hits);
});

export default search;
