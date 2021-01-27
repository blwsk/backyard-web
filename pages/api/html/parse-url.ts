import { doAsyncThing } from "../../../api-utils/doAsyncThing";
import { reader } from "../../../api-utils/reader";
import localEndpoint from "../../../api-utils/localEndpoint";
import { getPageContent } from "../../../api-utils/puppeteerUtils";

const parseUrlHtml = async (req, res) => {
  const url = decodeURI(req.query.url);

  const [content, contentError] = await doAsyncThing(() => getPageContent(url));

  if (!content || contentError) {
    res.status(500).send({
      message: "Error while fetching URL content",
      error: contentError,
    });
    return;
  }

  const readerView = reader(content.documentHtml, content.url);

  res.status(200).send(readerView);
};

export default localEndpoint(parseUrlHtml);
