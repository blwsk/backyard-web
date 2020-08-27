import fetch from "isomorphic-unfetch";

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

const tweet = async (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send(null);
    return;
  }

  const { ids } = req.query;

  const tweetResponse = await fetch(
    `https://api.twitter.com/2/tweets?ids=${ids}&expansions=${expansions}&tweet.fields=${tweetFields}&media.fields=${mediaFields}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    }
  );

  const tweetJson = await tweetResponse.json();

  res.status(200).send({
    message: `Success.`,
    tweets: tweetJson,
  });
};

export default tweet;
