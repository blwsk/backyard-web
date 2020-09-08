import fetch from "isomorphic-unfetch";
import faunadb, { query as q } from "faunadb";
import authedEndpoint from "../../api-utils/authedEndpoint";

const { FAUNADB_SECRET: secret } = process.env;

const client = new faunadb.Client({ secret });

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

  res.status(200).send({
    message: "Success. The provided id(s) have been deleted.",
    ids,
    result: JSON.stringify(result),
  });
});

export default deleteItems;
