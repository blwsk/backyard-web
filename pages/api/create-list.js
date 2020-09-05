import faunadb, { query as q } from "faunadb";
import authedEndpoint from "../../api-utils/authedEndpoint";

const { FAUNADB_SECRET: secret } = process.env;

const client = new faunadb.Client({ secret });

const createList = authedEndpoint(async (req, res, { user, err: userErr }) => {
  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  if (userErr || !(user && user.sub)) {
    res.status(401).send({
      message: "Authentication error.",
      error: "Missing user info",
    });
    return;
  }

  let bodyObject = {};

  try {
    bodyObject = JSON.parse(req.body);
  } catch (error) {
    void error;
  }

  const { name } = bodyObject;

  if (typeof name !== "string") {
    res.status(400).send({
      message: "Invalid request body",
      error: "Missing name string",
    });
    return;
  }

  let createResult;
  let createError;
  try {
    createResult = await client.query(
      q.Create(q.Collection("List"), {
        data: {
          name,
          createdBy: user.sub,
          createdAt: Date.now(),
        },
      })
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
    message: `List created.`,
    result: {
      id: createResult.ref.id,
      ts: createResult.ts,
      data: createResult.data,
    },
  });
});

export default createList;
