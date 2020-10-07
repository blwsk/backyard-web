import twilio from "twilio";
import authedEndpoint from "../../../api-utils/authedEndpoint";
import faunadb, { query as q } from "faunadb";

const {
  TWILIO_ACCOUNT_SID: accountSid,
  TWILIO_AUTH_TOKEN: authToken,
  FAUNADB_SECRET: secret,
} = process.env;

const twilioClient = twilio(accountSid, authToken);

const faunaClient = new faunadb.Client({ secret });

/**
 * random left-padded 4 character pin
 */
const generateRandomPin = () => {
  const pinInt = Math.floor(Math.random() * 10000);
  const pinStr = `${pinInt}`;

  const len = pinStr.length;
  const mustPad = 4 - len;

  let leftPadded = "";

  for (let i = 0; i < mustPad; i++) {
    leftPadded += "0";
  }

  return `${leftPadded}${pinStr}`;
};

const verifyPhoneNumber = authedEndpoint(
  async (req, res, { user, err: userErr }) => {
    void userErr;

    if (req.method !== "POST") {
      res.status(400).send(null);
      return;
    }

    let bodyObject = {};

    try {
      bodyObject = JSON.parse(req.body);
    } catch (error) {
      void error;
    }

    const { phoneNumber } = bodyObject;

    if (typeof phoneNumber !== "string") {
      res.status(400).send({
        message: "Invalid request body",
        error: "Missing phoneNumber",
      });
      return;
    }

    const pin = generateRandomPin();

    let verifierCreateResult;
    let verifierCreateError;
    try {
      verifierCreateResult = await faunaClient.query(
        q.Create(q.Collection("SmsVerifierPinSet"), {
          data: {
            number: phoneNumber,
            pin,
            userId: user.sub,
            expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes from now
          },
        })
      );
    } catch (err) {
      verifierCreateError = err;
    }

    if (verifierCreateError) {
      res.status(500).send({
        error: verifierCreateError,
      });
      return;
    }

    void verifierCreateResult;

    try {
      await twilioClient.messages.create({
        body: `Your pin is ${pin}`,
        from: "+12109039615",
        to: `+1${phoneNumber}`,
      });

      res.status(200).send({
        message: `We sent ${phoneNumber} a pin.`,
      });
    } catch (error) {
      void error;

      res.status(500).send({
        message: `Damn. Something broke.`,
      });
    }
  }
);

export default verifyPhoneNumber;
