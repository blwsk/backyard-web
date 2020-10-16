import { query as q, Client } from "faunadb";
import { fetchContent } from "./fetchContent";

interface FaunaObject {
  ref: {
    id: string;
  };
  ts: number;
  data: object;
}

interface ExistingItem {
  result?: FaunaObject;
  error?: Error;
}

const findExistingItem = async (
  client: Client,
  url: string
): Promise<ExistingItem> => {
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

interface ContentJson {
  body?: string;
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  json?: object;
}

interface CreatedItem {
  result?: FaunaObject;
  error?: Error;
}

const createItem = async (
  client: Client,
  url: string,
  contentJson: ContentJson,
  user
): Promise<CreatedItem> => {
  /**
   * - fetchTextContent returns `{ body, title, metaTitle, metaDescription }`
   * - fetchTweet returns `{ json }`
   */
  const { body, title, metaTitle, metaDescription, json } = contentJson;

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
          json: JSON.stringify(json),
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

export const Saved = "Saved";
export const AlreadySaved = "Already saved";
export const FindExistingItemError = "Error while finding existing item";
export const FetchContentError = "Error while fetching content for url";
export const CreateItemError = "Error while creating item";

export type SavedItemMessage =
  | "Saved"
  | "Already saved"
  | "Error while finding existing item"
  | "Error while fetching content for url"
  | "Error while creating item";

interface SavedItemMetadata {
  message: SavedItemMessage;
  result?: {
    id: string;
    ts: number;
    data: object;
  };
  alreadySaved: boolean;
  error?: Error;
  url?: string;
}

export const saveContentItem = async (
  client: Client,
  url: string,
  user: object
): Promise<SavedItemMetadata> => {
  /**
   * If item exists, return it
   */
  const { result, error } = await findExistingItem(client, url);

  if (result) {
    return {
      message: AlreadySaved,
      result: {
        id: result.ref.id,
        ts: result.ts,
        data: result.data,
      },
      alreadySaved: true,
    };
  }

  if (error && error.name !== "NotFound") {
    return {
      message: FindExistingItemError,
      error,
      alreadySaved: false,
    };
  }

  /**
   * Otherwise, fetch its content and create it
   */
  const { result: contentJson, error: contentError } = await fetchContent({
    url,
  });

  if (contentError) {
    return {
      message: FetchContentError,
      url,
      error: contentError,
      alreadySaved: false,
    };
  }

  const { result: itemResult, error: itemError } = await createItem(
    client,
    url,
    contentJson,
    user
  );

  if (itemError) {
    return {
      message: CreateItemError,
      url,
      error: itemError,
      alreadySaved: false,
    };
  }

  return {
    message: Saved,
    result: {
      id: itemResult.ref.id,
      ts: itemResult.ts,
      data: itemResult.data,
    },
    alreadySaved: false,
  };
};
