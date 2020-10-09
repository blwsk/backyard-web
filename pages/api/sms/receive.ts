import { twiml } from "twilio";

/*
twilio phone-numbers:update "+12109039615" --sms-url="https://69ae9bfc0782.ngrok.io/api/sms/receive"
*/

const { MessagingResponse } = twiml;

const receiveSms = async (req, res) => {
  console.log(req);

  const twiml = new MessagingResponse();

  twiml.message("The Robots are coming! Head for the hills!");

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
};

export default receiveSms;
