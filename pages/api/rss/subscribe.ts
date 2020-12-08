import faunadb, { query as q } from "faunadb";
import authedEndpoint from "../../../api-utils/authedEndpoint";
import { doAsyncThing } from "../../../api-utils/doAsyncThing";

const { FAUNADB_SECRET: secret } = process.env;

const faunaClient = new faunadb.Client({ secret });

type RequestBody = {
  feedUrl?: string;
};

const verifyPhoneNumber = authedEndpoint(
  async (req, res, { user, err: userErr }) => {
    void userErr;

    if (req.method !== "POST") {
      res.status(400).send(null);
      return;
    }

    let bodyObject: RequestBody = {};

    try {
      bodyObject = JSON.parse(req.body);
    } catch (error) {
      void error;
    }

    const { feedUrl } = bodyObject;

    if (typeof feedUrl !== "string") {
      res.status(400).send({
        message: "Invalid request body",
        error: "Missing url",
      });
      return;
    }

    const [subscribeResult, subscribeError] = await doAsyncThing(() =>
      faunaClient.query(
        q.Create(q.Collection("RssSubscription"), {
          data: {
            feedUrl,
            userId: user.sub,
          },
        })
      )
    );

    if (subscribeError) {
      res
        .status(500)
        .send({ message: "Failed to save rss sub", error: subscribeError });
      return;
    }

    res.status(200).send({
      message: "Subscribed to rss feed",
      result: subscribeResult,
    });
  }
);

export default verifyPhoneNumber;
