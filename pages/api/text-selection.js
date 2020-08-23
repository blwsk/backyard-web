import faunadb, { query as q } from "faunadb";

const { FAUNADB_SECRET: secret } = process.env;

const client = new faunadb.Client({ secret });

const textSelection = async (req, res) => {
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

  const { itemId, text } = bodyObject;

  if (typeof itemId !== "string" || typeof text !== "string") {
    const errors = [];

    if (typeof itemId !== "string") {
      errors.push("itemId of type string must be provided");
    }
    if (typeof text !== "string") {
      errors.push("text content must be provided via text field");
    }

    res.status(400).send({
      message: "Invalid request body.",
      errors,
    });
    return;
  }

  const itemRef = q.Ref(q.Collection("Item"), itemId);

  let result;
  let error;
  try {
    result = await client.query(
      q.Create(q.Collection("TextSelection"), {
        data: {
          text,
          item: itemRef,
        },
      })
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
    message: `Success. The text selection has been created.`,
    itemId,
    result: JSON.stringify(result),
  });
};

export default textSelection;
