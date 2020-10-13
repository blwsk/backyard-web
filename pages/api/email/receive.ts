import faunadb, { query as q } from "faunadb";

const { FAUNADB_SECRET: secret } = process.env;

const client = new faunadb.Client({ secret });

const createEmailInbox = async (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  const body = req.body;

  let createResult;
  let createError;
  try {
    createResult = await client.query(
      q.Create(q.Collection("ReceivedEmailBlobsV1"), {
        data: {
          json: body,
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
    message: "Email received",
    body,
    createResult,
  });
};

export default createEmailInbox;
