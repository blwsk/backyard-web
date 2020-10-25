import faunadb, { query as q } from "faunadb";
import authedEndpoint from "../../api-utils/authedEndpoint";
import {
  saveContentItem,
  FetchContentError,
  FindExistingItemError,
  Saved,
  AlreadySaved,
  CreateItemError,
} from "../../api-utils/saveContentItem";
import { MANUAL } from "../../types/ItemTypes";

const { FAUNADB_SECRET: secret } = process.env;

const client = new faunadb.Client({ secret });

const saveItem = authedEndpoint(async (req, res, { user, err: userErr }) => {
  if (req.method !== "PUT") {
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

  let url: string;

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

  const saveItemResultMetadata = await saveContentItem(
    client,
    url,
    user.sub,
    MANUAL
  );

  const { message, result, error, alreadySaved } = saveItemResultMetadata;

  switch (saveItemResultMetadata.message) {
    case FindExistingItemError:
    case FetchContentError:
    case CreateItemError:
      res.status(400).send({
        message,
        result,
        error,
        alreadySaved,
        url,
      });
      return;

    case Saved:
    case AlreadySaved:
      res.status(200).send({
        message,
        result,
        error,
        alreadySaved,
        url,
      });
      return;
  }
});

export default saveItem;
