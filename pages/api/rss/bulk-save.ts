import { serverToServerEndpoint } from "../../../api-utils/authedEndpoint";
import localEndpoint from "../../../api-utils/localEndpoint";
import { RSS } from "../../../types/ItemTypes";
import { saveContentItem } from "../../../api-utils/saveContentItem";

const wrapper =
  process.env.NODE_ENV === "development"
    ? localEndpoint
    : serverToServerEndpoint;

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
  const feedUrl = <string>req.query.feedUrl;

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
      saveContentItem(url, userId, RSS, {
        rssEntryContent: content,
        rssFeedUrl: feedUrl,
      })
    )
  );

  console.log(bulkOperation);

  res.status(200).send({
    message: `Success`,
  });
});

export default bulkSave;
