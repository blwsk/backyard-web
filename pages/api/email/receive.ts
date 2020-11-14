import faunadb, { query as q } from "faunadb";
import { MailSlurp } from "mailslurp-client";

import { getUserByMetadata } from "../../../api-utils/getUserByMetadata";
import { doAsyncThing } from "../../../api-utils/doAsyncThing";
import { parseEmail } from "../../../api-utils/parseEmail";
import { validURL } from "../../../lib/urls";
import {
  saveContentItem,
  getResponseFromMessage,
} from "../../../api-utils/saveContentItem";
import { EMAIL } from "../../../types/ItemTypes";
import { sendSms } from "../../../api-utils/sendSms";

const { FAUNADB_SECRET: secret, MAILSLURP_API_KEY: apiKey } = process.env;

const faunaClient = new faunadb.Client({ secret });

const mailslurp = new MailSlurp({ apiKey });

const makeEmailAddressFromId = (id) => `${id}@mailslurp.com`;

interface EmailWebhookBody {
  inboxId: string;
  emailId: string;
  createdAt: string;
  to: string[];
  from: string;
  cc: string[];
  bcc: string[];
  subject: string;
  attachmentMetaDatas: [];
}

const receiveEmail = async (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  const body: EmailWebhookBody = req.body;

  const { inboxId, emailId, subject, from, to } = body;

  console.log("Received Email", {
    inboxId,
    emailId,
    subject,
    from,
    to,
  });

  const emailIngestAddress = makeEmailAddressFromId(inboxId);

  const [userMetadataWrapper, userMetadataError] = await getUserByMetadata(
    faunaClient,
    {
      emailIngestAddress,
    }
  );

  const userId =
    userMetadataWrapper &&
    userMetadataWrapper.data &&
    userMetadataWrapper.data.userId;

  const phoneNumber =
    userMetadataWrapper &&
    userMetadataWrapper.data &&
    userMetadataWrapper.data.phoneNumber;

  if (userMetadataError || !userId) {
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
    console.log("No email body found", {
      error: emailContentError ? emailContentError.message : null,
      emailIngestAddress,
      emailContent,
      emailMetadata: { inboxId, emailId },
    });
    res.status(500).send({
      message: "No email body found",
      error: emailContentError ? emailContentError.message : null,
      emailIngestAddress,
      emailContent,
    });
    return;
  }

  const parseEmailResult = await parseEmail(emailContent.body, subject);

  const {
    isArticleParseable,
    readerView,
    emailReaderView,
    error: parseEmailError,
  } = parseEmailResult;

  if (parseEmailError) {
    console.log("Email parsing error", {
      error: parseEmailError,
      emailMetadata: { inboxId, emailId },
    });
    res.status(500).send({
      message: "Email parsing error",
      error: parseEmailError,
    });
    return;
  }

  const generatedTextContent = isArticleParseable
    ? readerView
    : emailReaderView;

  let createResult;
  let createError;
  try {
    createResult = await faunaClient.query(
      q.Create(q.Collection("ReceivedEmailBlobsV1"), {
        data: {
          json: emailContent,
          userId,
          generatedTextContent,
        },
      })
    );
  } catch (err) {
    createError = err;
  }

  if (createError) {
    console.log("ReceivedEmail create error", {
      error: createError,
      emailMetadata: { inboxId, emailId },
    });
    res.status(500).send({
      message: "ReceivedEmail create error",
      error: createError,
    });
    return;
  }

  const url = generatedTextContent.canonicalUrl || generatedTextContent.url;

  const parsedEmailBody = generatedTextContent.body;

  if (validURL(url)) {
    const { message, result, error } = await saveContentItem(
      faunaClient,
      url,
      userId,
      EMAIL,
      { emailBody: emailContent.body }
    );

    if (phoneNumber) {
      const saveContentMessage = getResponseFromMessage(message, result);

      /**
       *
       */
      const messageResponse = `✉️ Received an email, "${subject}", from ${from}.\n${saveContentMessage}`;

      await sendSms(messageResponse, phoneNumber);
    }
  } else {
    console.log("Invalid URL", {
      url: generatedTextContent.url,
      canonicalUrl: generatedTextContent.canonicalUrl,
      emailMetadata: { inboxId, emailId },
    });
  }

  res.status(200).send({
    message: "Email received",
    body,
    createResult,
  });
};

export default receiveEmail;
