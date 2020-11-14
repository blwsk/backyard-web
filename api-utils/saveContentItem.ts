import { query as q, Client } from "faunadb";
import algoliasearch from "algoliasearch";

import { fetchContent } from "./fetchContent";
import { Item, ItemSource, ItemOrigin } from "../types/ItemTypes";
import { doAsyncThing } from "./doAsyncThing";
import { ITEMS } from "../types/SearchIndexTypes";

const { ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY } = process.env;

const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);

const index = algoliaClient.initIndex(ITEMS);

interface FaunaObject {
  ref: {
    id: string;
  };
  ts: number;
  data: Item;
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
  userId: string,
  source?: ItemSource,
  itemOrigin?: ItemOrigin
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

  let itemOriginResult;
  let itemOriginError;
  try {
    itemOriginResult = await client.query(
      q.Create(q.Collection("ItemOrigin"), {
        data: {
          emailBody: itemOrigin.emailBody,
        },
      })
    );
  } catch (err) {
    itemOriginError = err;
  }

  if (itemOriginError) {
    return { result: itemOriginResult, error: itemOriginError };
  }

  let result;
  let error;
  try {
    result = await client.query(
      q.Create(q.Collection("Item"), {
        data: {
          url,
          createdBy: userId,
          createdAt: Date.now(),
          content: itemContentResult.ref,
          source,
          origin: itemOriginResult ? itemOriginResult.ref : null,
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
export const IndexingError = "Error while adding to search index";

export type SavedItemMessage =
  | "Saved"
  | "Already saved"
  | "Error while finding existing item"
  | "Error while fetching content for url"
  | "Error while creating item"
  | "Error while adding to search index";

export interface SavedItemDataWrapper {
  id: string;
  ts: number;
  data: Item;
}

export interface SavedItemMetadata {
  message: SavedItemMessage;
  result?: SavedItemDataWrapper;
  alreadySaved: boolean;
  error?: Error;
  url?: string;
}

export const getResponseFromMessage = (
  message: SavedItemMessage,
  result?: SavedItemDataWrapper
): string => {
  switch (message) {
    case FindExistingItemError:
    case FetchContentError:
    case CreateItemError:
    case IndexingError:
      return message;

    case Saved:
      return `✅ Saved. Check it out: https://backyard.wtf/viewer?id=${result.id}`;

    case AlreadySaved:
      return `☑️ Already saved. Check it out: https://backyard.wtf/viewer?id=${result.id}`;

    default:
      return "😱 Wow. We are in an unexpected state. Time to fix it and write some tests.";
  }
};

export const saveContentItem = async (
  client: Client,
  url: string,
  userId: string,
  source?: ItemSource,
  itemOrigin?: ItemOrigin
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
    userId,
    source,
    itemOrigin
  );

  if (itemError) {
    return {
      message: CreateItemError,
      url,
      error: itemError,
      alreadySaved: false,
    };
  }

  const [indexForSearchResult, indexForSearchError] = await doAsyncThing(() => {
    const fullObject = {
      objectID: itemResult.ref.id,
      _id: itemResult.ref.id,
      _ts: itemResult.ts,
      url,
      content: contentJson
        ? {
            title: contentJson.title,
            metaTitle: contentJson.metaTitle,
            metaDescription: contentJson.metaDescription,
            body: contentJson.body,
          }
        : null,
    };

    const trimmedObject = {
      objectID: itemResult.ref.id,
      _id: itemResult.ref.id,
      _ts: itemResult.ts,
      url,
      content: contentJson
        ? {
            title: contentJson.title,
            metaTitle: contentJson.metaTitle,
          }
        : null,
    };

    const objectToIndex =
      Buffer.byteLength(JSON.stringify(fullObject)) >= 100000 /* bytes */
        ? trimmedObject
        : fullObject;

    return index.saveObject(objectToIndex, {
      autoGenerateObjectIDIfNotExist: true,
    });
  });

  void indexForSearchResult;

  if (indexForSearchError) {
    return {
      message: IndexingError,
      url,
      error: indexForSearchError,
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
