import { TextContentData } from "../types/TextContentDataTypes";

const ENDPOINT_BASE =
  process.env.NODE_ENV === "development"
    ? `http://localhost:3001`
    : "https://backyard-data.vercel.app";

const ENDPOINT_PATH = "/api/index";

const REQUEST_URI = `${ENDPOINT_BASE}${ENDPOINT_PATH}`;

export const fetchTextContent = async ({
  url,
}): Promise<{ result: any; error: Error }> => {
  let result;
  let error;
  try {
    const res = await fetch(REQUEST_URI, {
      method: "PUT",
      body: JSON.stringify({
        url,
      }),
    });
    result = await res.json();
  } catch (err) {
    error = err;
  }

  return { result, error };
};
