import fetch from "isomorphic-unfetch";
import { doAsyncThing } from "../../api-utils/doAsyncThing";
import { reader } from "../../api-utils/reader";

const itemContent = async (req, res) => {
  if (req.method !== "PUT") {
    res.status(400).send(null);
    return;
  }

  let id;
  let url;

  try {
    const bodyJson = JSON.parse(req.body);
    id = bodyJson.id;
    url = bodyJson.url;
  } catch (error) {
    void error;
  }

  if (!url || !id) {
    res.status(400).send({
      message: "Expected request body to contain url and id properties.",
      provided: {
        id,
        url,
      },
    });
    return;
  }

  const [urlHtml, urlHtmlError] = await doAsyncThing(() =>
    fetch(url, {
      headers: {
        /**
         * HACK!!!
         */
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36",
        "Cache-Control": "no-cache",
        Accept: "*/*",
        Connection: "keep-alive",
      },
    }).then((r) => r.text())
  );

  if (!urlHtml || urlHtmlError) {
    res.status(500).send({
      message: "Error while fetching URL content",
      error: urlHtmlError,
    });
    return;
  }

  const readerView = reader(urlHtml, url);

  res.status(200).send({
    message: `Success.`,
    content: readerView,
  });
};

export default itemContent;
