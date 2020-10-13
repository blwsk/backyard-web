import { MailSlurp } from "mailslurp-client";
import faunadb from "faunadb";

import authedEndpoint from "../../../api-utils/authedEndpoint";
import { doAsyncThing } from "../../../api-utils/doAsyncThing";
import { updateUserMetadata } from "../../../api-utils/updateUserMetadata";

const { MAILSLURP_API_KEY: apiKey, FAUNADB_SECRET: secret } = process.env;

const mailslurp = new MailSlurp({ apiKey });

const faunaClient = new faunadb.Client({ secret });

const createEmailInbox = authedEndpoint(async (req, res, { user, err }) => {
  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  const [inbox, error, errorMessage] = await doAsyncThing(() =>
    mailslurp.createInbox()
  );

  if (error) {
    res.status(500).send({ inbox, error, errorMessage });
    return;
  }

  const { emailAddress, id } = inbox;

  if (!id) {
    res.status(500).send({
      inbox,
      error: new Error("Created inbox did not contain an id."),
      errorMessage: "Created inbox did not contain an id.",
    });
    return;
  }

  const [webhook, error2, errorMessage2] = await doAsyncThing(() =>
    mailslurp.webhookController.createWebhook(id, {
      url: `https://backyard.wtf/api/email/receive`,
    })
  );

  if (error2) {
    res
      .status(500)
      .send({ webhook, error: error2, errorMessage: errorMessage2 });
    return;
  }

  const { id: webhookId } = webhook;

  const [updatedMetadata, error3, errorMessage3] = await updateUserMetadata(
    faunaClient,
    user,
    {
      emailIngestAddress: emailAddress,
      emailIngestWebhookId: webhookId,
    }
  );

  res.status(200).send({
    emailAddress,
    id,
    webhook,
    webhookId,
    updatedMetadata,
    error2,
    errorMessage2,
    error3,
    errorMessage3,
  });
});

export default createEmailInbox;
