import faunadb, { query as q } from "faunadb";
import { serverToServerEndpoint } from "../../../api-utils/authedEndpoint";
import localEndpoint from "../../../api-utils/localEndpoint";
import { doAsyncThing } from "../../../api-utils/doAsyncThing";
import { RSS } from "../../../types/ItemTypes";
import { saveContentItem } from "../../../api-utils/saveContentItem";

const wrapper =
  process.env.NODE_ENV === "development"
    ? localEndpoint
    : serverToServerEndpoint;

const faunaClient = new faunadb.Client({ secret: process.env.FAUNADB_SECRET });

interface RssEntry {
  title: string;
  link: string;
  pubDate: string;
  author: string;
  content: string;
  contentSnipet: string;
  id: string;
  isoDate: string;
}

const bulkSave = wrapper(async (req, res) => {
  const userId = <string>req.query.userId;

  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  let itemsToSave: RssEntry[] = [];

  try {
    itemsToSave = JSON.parse(req.body);
  } catch (error) {
    void error;
  }

  const bulkOperation = await Promise.all(
    itemsToSave.map(({ link: url, content }) =>
      saveContentItem(faunaClient, url, userId, RSS, {
        rssEntryContent: content,
      })
    )
  );

  console.log(bulkOperation);

  res.status(200).send({
    message: `Success`,
  });
});

export default bulkSave;
