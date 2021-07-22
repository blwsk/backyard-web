import algoliasearch from "algoliasearch";
import { fetchContent } from "./fetchContent";
import { Item, ItemSource, ItemOrigin } from "../types/ItemTypes";
import { doAsyncThing } from "./doAsyncThing";
import { ITEMS } from "../types/SearchIndexTypes";
import { saveItem } from "./modern/items/saveItem";

const { ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY } = process.env;

const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);

const index = algoliaClient.initIndex(ITEMS);

const generateLegacyId = () => Math.floor(Math.random() * 1000000000000000);

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
  url: string,
  userId: string,
  source?: ItemSource,
  itemOrigin?: ItemOrigin
): Promise<SavedItemMetadata> => {
  /**
   * Fetch its content and create it
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

  const createdBy = userId,
    createdAt = Date.now();

  const legacyId = generateLegacyId().toString();

  const [saveResult, saveError] = await saveItem({
    legacyId,
    url,
    createdAt,
    createdBy,
    content: contentJson,
    source,
    origin: itemOrigin,
  });

  if (saveError) {
    return {
      message: CreateItemError,
      url,
      error: saveError,
      alreadySaved: false,
    };
  }

  const microSecondTs = createdAt * 1000;

  const [indexForSearchResult, indexForSearchError] = await doAsyncThing(
    async () => {
      const fullObject = {
        objectID: legacyId,
        _id: legacyId,
        _ts: microSecondTs,
        createdBy: userId,
        url,
        content: contentJson
          ? {
              title: contentJson.title,
              metaTitle: contentJson.metaTitle,
              metaDescription: contentJson.metaDescription,
            }
          : null,
      };

      const trimmedObject = {
        objectID: legacyId,
        _id: legacyId,
        _ts: microSecondTs,
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
    }
  );

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
      id: legacyId,
      ts: createdAt,
      data: saveResult,
    },
    alreadySaved: false,
  };
};
