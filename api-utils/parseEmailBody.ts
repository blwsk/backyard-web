import { TextContentData } from "./TextContentDataTypes";

const ENDPOINT_BASE =
  process.env.NODE_ENV === "development"
    ? `http://localhost:3001`
    : "https://backyard-data.vercel.app";

const ENDPOINT_PATH = "/api/emailparser";

const REQUEST_URI = `${ENDPOINT_BASE}${ENDPOINT_PATH}`;

export const parseEmailBody = async (
  emailBody: string
): Promise<[TextContentData, Error]> => {
  let result;
  let error;
  try {
    const res = await fetch(REQUEST_URI, {
      method: "PUT",
      body: emailBody,
    });
    result = await res.json();
  } catch (err) {
    error = err;
  }

  return [result, error];
};
