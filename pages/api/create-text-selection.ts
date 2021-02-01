import algoliasearch from "algoliasearch";
import faunadb, { query as q } from "faunadb";
import authedEndpoint from "../../api-utils/authedEndpoint";
import { doAsyncThing } from "../../api-utils/doAsyncThing";
import { CLIPS } from "../../types/SearchIndexTypes";
import { ClipExportData } from "../../types/ExportTypes";
import { saveClip } from "../../api-utils/modern/save-clip/saveClip";

const {
  ALGOLIA_APP_ID,
  ALGOLIA_ADMIN_API_KEY,
  FAUNADB_SECRET: secret,
} = process.env;

const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);

const index = algoliaClient.initIndex(CLIPS);

const client = new faunadb.Client({ secret });

type RequestBody = {
  itemId?: string;
  text?: string;
  modernItemId?: string;
};

const createTextSelection = authedEndpoint(
  async (req, res, { user, err: userErr }) => {
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

    let bodyObject: RequestBody = {};

    try {
      bodyObject = JSON.parse(req.body);
    } catch (error) {
      void error;
    }

    const { itemId, text, modernItemId } = bodyObject;

    if (
      typeof itemId !== "string" ||
      typeof text !== "string" ||
      typeof modernItemId !== "string"
    ) {
      const errors = [];

      if (typeof itemId !== "string") {
        errors.push("itemId of type string must be provided");
      }
      if (typeof text !== "string") {
        errors.push("text content must be provided via text field");
      }
      if (typeof modernItemId !== "string") {
        errors.push("modernItemId must be a number");
      }

      res.status(400).send({
        message: "Invalid request body.",
        errors,
      });
      return;
    }

    const itemRef = q.Ref(q.Collection("Item"), itemId);

    const createdAt = Date.now(),
      createdBy = user.sub;

    const [textSelectionResult, error] = await doAsyncThing(() =>
      client.query(
        q.Create(q.Collection("TextSelection"), {
          data: {
            text,
            item: itemRef,
            createdBy,
            createdAt,
          },
        })
      )
    );

    const legacyId = textSelectionResult.ref.id;

    const [dualWriteResult, dualWriteError] = await doAsyncThing(() =>
      saveClip(
        {
          text,
          createdAt,
          createdBy,
          itemId: modernItemId,
        },
        legacyId
      )
    );

    if (error || dualWriteError) {
      res.status(500).send({
        error: error || dualWriteError,
      });
      return;
    }

    const [
      textSelectionResultId,
      textSelectionResultIdError,
    ] = await doAsyncThing(() =>
      client.query(q.Select(["ref", "id"], q.Get(textSelectionResult.ref)))
    );

    if (textSelectionResultIdError) {
      res.status(500).send({
        error: textSelectionResultIdError,
      });
      return;
    }

    const [indexForSearchResult, indexForSearchError] = await doAsyncThing(
      async () => {
        const {
          data: { text: selectionText, createdBy, createdAt },
        } = textSelectionResult;

        const clipObject: ClipExportData = {
          objectID: textSelectionResultId,
          _id: textSelectionResultId,
          itemId,
          text: selectionText,
          createdAt,
          createdBy,
        };

        return index.saveObject(clipObject, {
          autoGenerateObjectIDIfNotExist: true,
        });
      }
    );

    if (indexForSearchError) {
      console.log(indexForSearchError);
      res.status(500).send({
        error: indexForSearchError,
      });
      return;
    }

    res.status(200).send({
      message: `Success. The text selection has been created.`,
      itemId,
      result: indexForSearchResult,
    });
  }
);

export default createTextSelection;
