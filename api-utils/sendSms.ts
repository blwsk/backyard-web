import twilio from "twilio";
import { TWILIO_PHONE_NUMBER } from "../lib/twilioConstants";

const {
  TWILIO_ACCOUNT_SID: accountSid,
  TWILIO_AUTH_TOKEN: authToken,
} = process.env;

const twilioClient = twilio(accountSid, authToken);

type PhoneNumber = string;

export const sendSms = (messageText: string, to: PhoneNumber): Promise<any> => {
  return twilioClient.messages.create({
    body: messageText,
    from: `+1${TWILIO_PHONE_NUMBER}`,
    to: `+1${to}`,
  });
};
