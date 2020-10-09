import twilio from "twilio";

const {
  TWILIO_ACCOUNT_SID: accountSid,
  TWILIO_AUTH_TOKEN: authToken,
} = process.env;

const twilioClient = twilio(accountSid, authToken);

const sendSms = async (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  const { messageText } = req.query;

  const message = await twilioClient.messages.create({
    body: messageText,
    from: "+12109039615",
    to: "+19089671305",
  });

  res.status(200).send(message);
};

export default sendSms;
