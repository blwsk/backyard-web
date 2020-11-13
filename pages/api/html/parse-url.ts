import { doAsyncThing } from "../../../api-utils/doAsyncThing";
import { reader } from "../../../api-utils/reader";
import localEndpoint from "../../../api-utils/localEndpoint";

const parseUrlHtml = async (req, res) => {
  const url = decodeURI(req.query.url);

  const [urlHtml, urlHtmlError] = await doAsyncThing(() =>
    fetch(url).then((r) => r.text())
  );

  if (!urlHtml || urlHtmlError) {
    res.status(500).send({
      message: "Error while fetching URL content",
      error: urlHtmlError,
    });
    return;
  }

  const readerView = reader(urlHtml, url);

  res.status(200).send(readerView);
};

export default localEndpoint(parseUrlHtml);
