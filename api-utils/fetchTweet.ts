import fetch from "isomorphic-unfetch";
import { getTweetIdFromUrl } from "../lib/tweetIdFromUrl";
const { TWITTER_BEARER_TOKEN: secret } = process.env;

const expansions = [
  "attachments.media_keys",
  "referenced_tweets.id",
  "author_id",
].join(",");

const tweetFields = "created_at";

const mediaFields = [
  "duration_ms",
  "height",
  "media_key",
  "preview_image_url",
  "type",
  "url",
  "width",
].join(",");

/**
 *
 * @param {String} idString 123 or 123,456
 */
export const fetchTweet = async (idString) => {
  const tweetResponse = await fetch(
    `https://api.twitter.com/2/tweets?ids=${idString}&expansions=${expansions}&tweet.fields=${tweetFields}&media.fields=${mediaFields}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    }
  );

  const tweetJson = await tweetResponse.json();

  return tweetJson;
};

export const fetchTweetByUrl = async ({
  url,
}): Promise<{ result: any; error: Error }> => {
  const { id } = getTweetIdFromUrl(url);

  let result;
  let error;
  try {
    const json = await fetchTweet(id);
    result = { json };
  } catch (err) {
    error = err;
  }

  return { result, error };
};
