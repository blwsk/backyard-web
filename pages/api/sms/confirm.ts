import authedEndpoint from "../../../api-utils/authedEndpoint";
import { confirm } from "../../../api-utils/modern/sms/confirm";
import { graphql } from "../../../api-utils/modern/graphql";
import gql from "gql-tag";

type RequestBody = {
  pin?: string;
  phoneNumber?: string;
};

const confirmPin = authedEndpoint(async (req, res, { user, err: userErr }) => {
  void userErr;

  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  let bodyObject: RequestBody = {};

  try {
    bodyObject = JSON.parse(req.body);
  } catch (error) {
    void error;
  }

  const { pin, phoneNumber } = bodyObject;

  if (typeof pin !== "string") {
    res.status(400).send({
      message: "Invalid request body",
      error: "Missing pin number",
    });
    return;
  }

  if (typeof phoneNumber !== "string") {
    res.status(400).send({
      message: "Invalid request body",
      error: "Missing phoneNumber",
    });
    return;
  }

  const [confirmResult, confirmError] = await confirm({
    phoneNumber,
    userId: user.sub,
    pin,
  });

  if (confirmError) {
    res.status(500).send({
      error: confirmError,
    });
    return;
  }

  const { message, match } = confirmResult;

  if (message === "Expired") {
    res.status(400).send({
      message: `Pin has expired.`,
    });
    return;
  }

  if (!match) {
    res.status(400).send({
      message: `Incorrect PIN.`,
    });
    return;
  }

  /**
   * Woohoo! We've validated the phone number. Time to record it in our DB as "verified".
   */

  const [updateUserMetadataResult, updateUserMetadataError] = await graphql({
    query: gql`
      mutation($userId: String!, $phoneNumber: String!) {
        createPhoneNumber(userId: $userId, phoneNumber: $phoneNumber) {
          phoneNumber
        }
      }
    `,
    variables: {
      phoneNumber,
      userId: user.sub,
    },
    userId: user.sub,
  });

  if (updateUserMetadataError) {
    res.status(500).send({
      error: updateUserMetadataError,
    });
    return;
  }

  res.status(200).send({
    message: `Success.`,
    result: updateUserMetadataResult,
  });
});

export default confirmPin;
