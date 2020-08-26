import faunadb, { query as q } from "faunadb";

const { FAUNADB_SECRET: secret } = process.env;

const client = new faunadb.Client({ secret });

const createItem = async (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  let bodyObject = {};

  try {
    bodyObject = JSON.parse(req.body);
  } catch (error) {
    void error;
  }

  const { url } = bodyObject;

  if (typeof url !== "string") {
    res.status(400).send({
      message: "Invalid request body",
      error: "Missing url string",
    });
    return;
  }

  let result;
  let error;
  try {
    result = await client.query(
      q.Get(q.Match(q.Index("unique_Item_url"), url))
    );
  } catch (err) {
    error = err;
  }

  if (result) {
    res.status(200).send({
      message: `Already saved`,
      result: {
        id: result.ref.id,
        ts: result.ts,
        data: result.data,
      },
      alreadySaved: true,
    });
    return;
  }

  /**
   * Some other error aside from 404
   */
  if (error && error.name !== "NotFound") {
    res.status(500).send({
      error,
    });
    return;
  }

  let createResult;
  let createError;
  try {
    createResult = await client.query(
      q.Create(q.Collection("Item"), { data: { url } })
    );
  } catch (err) {
    createError = err;
  }

  if (createError) {
    res.status(500).send({
      error: createError,
    });
    return;
  }

  res.status(200).send({
    message: `Saved`,
    result: {
      id: createResult.ref.id,
      ts: createResult.ts,
      data: createResult.data,
    },
    alreadySaved: false,
  });
};

export default createItem;
