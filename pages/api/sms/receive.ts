import twilio, { twiml } from "twilio";
import faunadb, { query as q } from "faunadb";
import { doAsyncThing } from "../../../api-utils/doAsyncThing";
import { getUserByMetadata } from "../../../api-utils/getUserByMetadata";

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

  if (
    userMetadataError ||
    !userMetadata ||
    !userMetadata.data ||
    !userMetadata.data.userId
  ) {
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
          userId: userMetadata.data.userId,
        },
      })
    )
  );

  if (error) {
    const twiml = new MessagingResponse();

    twiml.message(`Error: ${errorMessage}`);

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }

  const twiml = new MessagingResponse();

  twiml.message(`Message saved.`);

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
};

export default receiveSms;
