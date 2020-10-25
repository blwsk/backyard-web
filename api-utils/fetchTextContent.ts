import { TextContentData } from "../types/TextContentDataTypes";

const ENDPOINT_BASE =
  process.env.NODE_ENV === "development"
    ? `http://localhost:3001`
    : "https://backyard-data.vercel.app";

const ENDPOINT_PATH = "/api/index";

const REQUEST_URI = `${ENDPOINT_BASE}${ENDPOINT_PATH}`;

/*
"url": url,
"body": returnable_main_content,
"title": title,
"metaTitle": meta_title,
"metaDescription": meta_description,
*/

export const fetchTextContent = async ({
  url,
}): Promise<{ result: TextContentData; error: Error }> => {
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
