import twilio from "twilio";
import authedEndpoint from "../../../api-utils/authedEndpoint";
import { verify } from "../../../api-utils/modern/sms/verify";
import { TWILIO_PHONE_NUMBER } from "../../../lib/twilioConstants";

const {
  TWILIO_ACCOUNT_SID: accountSid,
  TWILIO_AUTH_TOKEN: authToken,
} = process.env;

const twilioClient = twilio(accountSid, authToken);

type RequestBody = {
  phoneNumber?: string;
};

const verifyPhoneNumber = authedEndpoint(
  async (req, res, { user, err: userErr }) => {
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

    const { phoneNumber } = bodyObject;

    if (typeof phoneNumber !== "string") {
      res.status(400).send({
        message: "Invalid request body",
        error: "Missing phoneNumber",
      });
      return;
    }

    const [verifierCreateResult, verifierCreateError] = await verify({
      phoneNumber,
      userId: user.sub,
    });

    if (verifierCreateError) {
      res.status(500).send({
        error: verifierCreateError,
      });
      return;
    }

    console.log(verifierCreateResult);

    const { pin } = verifierCreateResult;

    try {
      await twilioClient.messages.create({
        body: `Your pin is ${pin}`,
        from: `+1${TWILIO_PHONE_NUMBER}`,
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
