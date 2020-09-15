import fetch from "isomorphic-unfetch";
import faunadb, { query as q } from "faunadb";
import authedEndpoint from "../../api-utils/authedEndpoint";

const { FAUNADB_SECRET: secret } = process.env;

const client = new faunadb.Client({ secret });

const REQUEST_URI =
  process.env.NODE_ENV === "development"
    ? `http://localhost:3001/api/index`
    : "https://backyard-data.vercel.app/api/index";

const fetchContent = async ({ url }) => {
  let result;
  let error;
  try {
    const res = await fetch(REQUEST_URI, {
      method: "PUT",
      body: JSON.stringify({
        url,
      }),
    });
    result = await res.json();
  } catch (err) {
    error = err;
  }

  return { result, error };
};

const findExistingItem = async ({ url }) => {
  let result;
  let error;
  try {
    result = await client.query(
      q.Get(q.Match(q.Index("unique_Item_url"), url))
    );
  } catch (err) {
    error = err;
  }

  return { result, error };
};

const createItem = async ({ url, contentJson, user }) => {
  const { body, title, metaTitle, metaDescription } = contentJson;

  let itemContentResult;
  let itemContentError;
  try {
    itemContentResult = await client.query(
      q.Create(q.Collection("ItemContent"), {
        data: {
          body,
          title,
          metaTitle,
          metaDescription,
        },
      })
    );
  } catch (err) {
    itemContentError = err;
  }

  if (itemContentError) {
    return { result: itemContentResult, error: itemContentError };
  }

  let result;
  let error;
  try {
    result = await client.query(
      q.Create(q.Collection("Item"), {
        data: {
          url,
          createdBy: user.sub,
          createdAt: Date.now(),
          content: itemContentResult.ref,
        },
      })
    );
  } catch (err) {
    error = err;
  }

  return { result, error };
};

const saveItem = authedEndpoint(async (req, res, { user, err: userErr }) => {
  if (req.method !== "PUT") {
    res.status(400).send(null);
    return;
  }

  /**
   * Auth
   */

  if (userErr || !(user && user.sub)) {
    res.status(401).send({
      message: "Authentication error.",
      error: "Missing user info",
    });
    return;
  }

  /**
   * Get URL from body
   */

  let url;

  try {
    const bodyJson = JSON.parse(req.body);
    url = bodyJson.url;
  } catch (error) {
    void error;
  }

  if (!url) {
    res.status(400).send({
      message: "Expected request body to contain url property.",
      provided: {
        url,
      },
    });
    return;
  }

  /**
   * If item exists, return it
   */

  const { result, error } = await findExistingItem({ url });

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

  if (error && error.name !== "NotFound") {
    /**
     * Some other error aside from 404
     */

    console.log(error);

    res.status(500).send({
      message: "Error while finding existing item",
      error,
    });
    return;
  }

  /**
   * Otherwise, fetch its content and create it
   */

  const { result: contentJson, error: contentError } = await fetchContent({
    url,
  });

  if (contentError) {
    console.log(contentError);
    res.status(500).send({
      message: "Error while fetching content for url",
      url,
      error: contentError,
    });
    return;
  }

  const { result: itemResult, error: itemError } = await createItem({
    url,
    contentJson,
    user,
  });

  if (itemError) {
    res.status(500).send({
      message: "Error while creating item",
      contentJson,
      url,
      error: itemError,
    });
    return;
  }

  res.status(200).send({
    message: `Saved`,
    result: {
      id: itemResult.ref.id,
      ts: itemResult.ts,
      data: itemResult.data,
    },
    alreadySaved: false,
  });
});

export default saveItem;
