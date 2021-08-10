import authedEndpoint from "../../api-utils/authedEndpoint";
import { doAsyncThing } from "../../api-utils/doAsyncThing";
import { saveClip } from "../../api-utils/modern/clips/saveClip";

const generateLegacyId = () => Math.floor(Math.random() * 1000000000000000);

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

    const createdAt = Date.now(),
      createdBy = user.sub;

    const legacyId = generateLegacyId().toString();

    const [createClipResult, createClipError] = await doAsyncThing(() =>
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

    if (createClipError) {
      res.status(500).send({
        error: createClipError,
      });
      return;
    }

    res.status(200).send({
      message: `Success. The text selection has been created.`,
      itemId,
      result: createClipResult,
    });
  }
);

export default createTextSelection;
