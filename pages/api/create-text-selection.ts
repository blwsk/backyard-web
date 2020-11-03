import algoliasearch from "algoliasearch";
import faunadb, { query as q } from "faunadb";
import authedEndpoint from "../../api-utils/authedEndpoint";
import { doAsyncThing } from "../../api-utils/doAsyncThing";
import { CLIPS } from "../../types/SearchIndexTypes";
import { ClipExportData } from "../../types/ExportTypes";

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
    let resultIncrement;
    let error;

    result = await Promise.all([
      client.query(
        q.Create(q.Collection("TextSelection"), {
          data: {
            text,
            item: itemRef,
            createdBy: user.sub,
            createdAt: Date.now(),
          },
        })
      ),
      client.query(
        q.Call(q.Function("incrementClipCountForItem"), itemRef, user.sub)
      ),
    ]).catch((e) => (error = e));

    void resultIncrement;

    if (error) {
      res.status(500).send({
        error,
      });
      return;
    }

    const [textSelectionResult, clipCountIncrementResult] = result;

    void clipCountIncrementResult;

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
      () => {
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

    void indexForSearchResult;

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
      result: JSON.stringify(result),
    });
  }
);

export default createTextSelection;
