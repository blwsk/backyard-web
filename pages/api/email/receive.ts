import faunadb, { query as q } from "faunadb";
import { MailSlurp } from "mailslurp-client";

import { getUserByMetadata } from "../../../api-utils/getUserByMetadata";
import { doAsyncThing } from "../../../api-utils/doAsyncThing";
import { parseEmailBody } from "../../../api-utils/parseEmailBody";

const { FAUNADB_SECRET: secret, MAILSLURP_API_KEY: apiKey } = process.env;

const faunaClient = new faunadb.Client({ secret });

const mailslurp = new MailSlurp({ apiKey });

const makeEmailAddressFromId = (id) => `${id}@mailslurp.com`;

const createEmailInbox = async (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  const body = req.body;

  const { inboxId, emailId } = body;

  const emailIngestAddress = makeEmailAddressFromId(inboxId);

  const [userMetadata, userMetadataError] = await getUserByMetadata(
    faunaClient,
    {
      emailIngestAddress,
    }
  );

  if (
    userMetadataError ||
    !userMetadata ||
    !userMetadata.data ||
    !userMetadata.data.userId
  ) {
    res.status(500).send({
      message: "Could not find a user with the provided emailIngestAddress",
      error: userMetadataError ? userMetadataError.message : null,
      emailIngestAddress,
    });
    return;
  }

  const [emailContent, emailContentError] = await doAsyncThing(() =>
    mailslurp.emailController.getEmail(emailId)
  );

  if (
    emailContentError ||
    !emailContent ||
    typeof emailContent.body !== "string"
  ) {
    res.status(500).send({
      message: "No email body found",
      error: emailContentError ? emailContentError.message : null,
      emailIngestAddress,
      emailContent,
    });
    return;
  }

  const [
    generatedTextContent,
    generatedTextContentError,
  ] = await parseEmailBody(emailContent.body);

  let createResult;
  let createError;
  try {
    createResult = await faunaClient.query(
      q.Create(q.Collection("ReceivedEmailBlobsV1"), {
        data: {
          json: emailContent,
          userId: userMetadata.data.userId,
          generatedTextContent,
        },
      })
    );
  } catch (err) {
    createError = err;
  }

  if (createError) {
    res.status(500).send({
      error: createError,
    });
    return;
  }

  res.status(200).send({
    message: "Email received",
    body,
    createResult,
  });
};

export default createEmailInbox;
