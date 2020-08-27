import fetch from "isomorphic-unfetch";

const { TWITTER_BEARER_TOKEN: secret } = process.env;

const tweet = async (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send(null);
    return;
  }

  const { ids } = req.query;

  const tweetResponse = await fetch(
    `https://api.twitter.com/2/tweets?ids=${ids}&expansions=attachments.media_keys,referenced_tweets.id,author_id&media.fields=duration_ms,height,media_key,preview_image_url,public_metrics,type,url,width`,
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
