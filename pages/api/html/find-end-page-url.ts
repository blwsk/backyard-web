import { doAsyncThing } from "../../../api-utils/doAsyncThing";
import { findEndPageUrl } from "../../../api-utils/puppeteerUtils";
import localEndpoint from "../../../api-utils/localEndpoint";

const parseUrlHtml = async (req, res) => {
  const url = decodeURI(req.query.url);

  const [endPageUrl, error] = await doAsyncThing(() => findEndPageUrl(url));

  if (error) {
    res.status(500).send(error);
    return;
  }

  res.status(200).send(endPageUrl);
};

export default localEndpoint(parseUrlHtml);
