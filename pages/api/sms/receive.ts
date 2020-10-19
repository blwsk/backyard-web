import twilio, { twiml } from "twilio";
import faunadb, { query as q } from "faunadb";
import { doAsyncThing } from "../../../api-utils/doAsyncThing";
import { getUserByMetadata } from "../../../api-utils/getUserByMetadata";
import { validURL } from "../../../lib/urls";
import {
  saveContentItem,
  FindExistingItemError,
  FetchContentError,
  CreateItemError,
  Saved,
  AlreadySaved,
} from "../../../api-utils/saveContentItem";

const { FAUNADB_SECRET: secret } = process.env;

const faunaClient = new faunadb.Client({ secret });

const { MessagingResponse } = twiml;

const receiveSms = async (req, res) => {
  const { From, To, Body, MessageSid, AccountSid } = req.body;
  void To, Body, MessageSid, AccountSid;

  const fromPhoneNumber = From.replace("+1", "");

  const [userMetadata, userMetadataError] = await getUserByMetadata(
    faunaClient,
    {
      phoneNumber: fromPhoneNumber,
    }
  );

  const userId: string | null =
    userMetadata && userMetadata.data && userMetadata.data.userId
      ? userMetadata.data.userId
      : null;

  if (userMetadataError || !userId) {
    const twiml = new MessagingResponse();

    twiml.message(
      `Uh oh! We don't recognize your phone number. Verify it here: https://backyard.wtf/settings`
    );

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }

  const [result, error, errorMessage] = await doAsyncThing(() =>
    faunaClient.query(
      q.Create(q.Collection("ReceivedSMSBlobsV1"), {
        data: {
          json: req.body,
          userId,
        },
      })
    )
  );

  const url = validURL(Body) ? Body : null;

  /**
   *
   * Next, we'll have to add env variables to tell Twilio which webhook to send the message to:
   *
   * Prod: backyard.wtf
   * Staging: ...
   * Dev: ngrok.io url
   *
   */

  if (url) {
    const { message, result } = await saveContentItem(faunaClient, url, userId);

    const twiml = new MessagingResponse();

    let messageResponse;

    switch (message) {
      case FindExistingItemError:
      case FetchContentError:
      case CreateItemError:
        messageResponse = message;
        break;

      case Saved:
        messageResponse = `Saved. Check it out: https://backyard.wtf/viewer?id=${result.id}`;
        break;
      case AlreadySaved:
        messageResponse = `Already saved. Check it out: https://backyard.wtf/viewer?id=${result.id}`;
        break;

      default:
        messageResponse =
          "Wow. We are in an unexpected state. Time to fix it and write some tests.";
    }

    twiml.message(messageResponse);

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }

  if (error) {
    const twiml = new MessagingResponse();

    twiml.message(`Error: ${errorMessage}`);

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }

  /**
   * Save item here!
   */

  const twiml = new MessagingResponse();

  twiml.message(`This doesn't look like a URL.`);

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
};

export default receiveSms;
