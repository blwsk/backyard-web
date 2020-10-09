import authedEndpoint from "../../api-utils/authedEndpoint";
import { fetchTweet } from "../../api-utils/fetchTweet";

const tweet = authedEndpoint(async (req, res) => {
  if (req.method !== "GET") {
    res.status(400).send(null);
    return;
  }

  const { ids } = req.query;

  const tweetJson = await fetchTweet(ids);

  res.status(200).send({
    message: `Success.`,
    tweets: tweetJson,
  });
});

export default tweet;
