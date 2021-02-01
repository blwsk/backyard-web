import algoliasearch from "algoliasearch";
import { doAsyncThing } from "../../api-utils/doAsyncThing";
import faunadb, { query as q } from "faunadb";
import authedEndpoint from "../../api-utils/authedEndpoint";

const {
  FAUNADB_SECRET: secret,
  ALGOLIA_APP_ID,
  ALGOLIA_ADMIN_API_KEY,
} = process.env;

const client = new faunadb.Client({ secret });

const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);

const INDEX_NAME = "backyard_test";

const index = algoliaClient.initIndex(INDEX_NAME);

const deleteItems = authedEndpoint(async (req, res) => {
  if (req.method !== "DELETE") {
    res.status(400).send(null);
    return;
  }

  let ids = [];

  try {
    ids = JSON.parse(req.body);
  } catch (error) {
    void error;
  }

  if (ids.length === 0) {
    res.status(400).send({
      message:
        "Expected request body with array of id strings. None was provided.",
    });
    return;
  }

  const refs = ids.map((id) => q.Ref(q.Collection("Item"), id));

  let result;
  let error;
  try {
    result = await client.query(
      q.Foreach(refs, q.Lambda("ref", q.Delete(q.Var("ref"))))
    );
  } catch (err) {
    error = err;
  }

  if (error) {
    res.status(500).send({
      error,
    });
    return;
  }

  const [
    deleteFromSearchResult,
    deleteFromSearchError,
  ] = await doAsyncThing(async () =>
    index.deleteObjects(ids.map((id) => `${id}`))
  );

  void deleteFromSearchResult;

  if (deleteFromSearchError) {
    res.status(500).send({
      error: deleteFromSearchError,
    });
    return;
  }

  res.status(200).send({
    message: "Success. The provided id(s) have been deleted.",
    ids,
    result: JSON.stringify(result),
    deleteFromSearchResult,
  });
});

export default deleteItems;
