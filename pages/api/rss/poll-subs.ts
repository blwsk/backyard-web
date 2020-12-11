import faunadb, { query as q } from "faunadb";
import { serverToServerEndpoint } from "../../../api-utils/authedEndpoint";
import localEndpoint from "../../../api-utils/localEndpoint";
import { doAsyncThing } from "../../../api-utils/doAsyncThing";

const wrapper =
  process.env.NODE_ENV === "development"
    ? localEndpoint
    : serverToServerEndpoint;

const faunaClient = new faunadb.Client({ secret: process.env.FAUNADB_SECRET });

const pollSubscriptions = wrapper(async (req, res) => {
  const [subs, subsError] = await doAsyncThing(() =>
    faunaClient.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection("RssSubscription")), { size: 100 }),
        q.Lambda(["i"], q.Get(q.Var("i")))
      )
    )
  );

  if (subsError) {
    res.status(500).send({
      message: `DB lookup failed at ${new Date().toLocaleString()}`,
      error: subsError,
    });
    return;
  }

  const { data, before, after } = subs;

  const subscriptions = data.map(({ data: { feedUrl, userId } }) => ({
    feedUrl,
    userId,
  }));

  res.status(200).send({
    message: `Polled subscriptions at ${new Date().toLocaleString()}`,
    json: subscriptions,
    before: before ? JSON.stringify(before) : null,
    after: after ? JSON.stringify(after) : null,
  });
});

export default pollSubscriptions;
