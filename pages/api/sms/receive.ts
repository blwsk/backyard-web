import { twiml } from "twilio";
import faunadb, { query as q } from "faunadb";
import { doAsyncThing } from "../../../api-utils/doAsyncThing";
import { getUserByMetadata } from "../../../api-utils/getUserByMetadata";
import { validURL } from "../../../lib/urls";
import {
  saveContentItem,
  SavedItemMetadata,
  getResponseFromMessage,
} from "../../../api-utils/saveContentItem";
import { SMS } from "../../../types/ItemTypes";
import { getUserMetadataByPhoneNumber } from "../../../api-utils/modern/user/getUserMetadataByPhoneNumber";

const { FAUNADB_SECRET: secret } = process.env;

const faunaClient = new faunadb.Client({ secret });

const { MessagingResponse } = twiml;

const receiveSms = async (req, res) => {
  const { From, To, Body, MessageSid, AccountSid } = req.body;

  console.log("Received SMS", {
    From,
    To,
    Body,
    MessageSid,
    AccountSid,
  });

  const fromPhoneNumber = From.replace("+1", "");

  const [userMetadata, userMetadataError] = await getUserMetadataByPhoneNumber({
    phoneNumber: fromPhoneNumber,
  });

  const userId: string | null =
    userMetadata && userMetadata.userId ? userMetadata.userId : null;

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
   * See https://github.com/blwsk/backyard-web/issues/34
   *
   */

  if (url) {
    const { message, result }: SavedItemMetadata = await saveContentItem(
      faunaClient,
      url,
      userId,
      SMS
    );

    const twiml = new MessagingResponse();

    let messageResponse = getResponseFromMessage(message, result);

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
