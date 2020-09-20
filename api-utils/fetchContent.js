import { fetchTextContent } from "./fetchTextContent";
import { isTwitter } from "../lib/contentTypes";
import { fetchTweetByUrl } from "./fetchTweet";

const getFn = (url) => {
  switch (true) {
    case isTwitter(url):
      return fetchTweetByUrl;
    default:
      return fetchTextContent;
  }
};

export const fetchContent = async ({ url }) => {
  const fn = getFn(url);

  let result;
  let error;

  try {
    result = await fn({ url });
  } catch (err) {
    error = err;
  }

  return { result, error };
};
