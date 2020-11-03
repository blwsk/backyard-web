import { reader, getEndPageUrl } from "../../../api-utils/reader";
import { doAsyncThing } from "../../../api-utils/doAsyncThing";

const parseEmail = async (req, res) => {
  const { subject } = req.query;
  const { body } = req;

  if (typeof body !== "string") {
    res.status(500).send({
      message: "Request body was expected to be an html string",
      body,
    });
    return;
  }

  const endPageUrl = await getEndPageUrl(body, subject);

  const isArticleParseable = !!endPageUrl;

  if (!isArticleParseable) {
    const emailReaderView = reader(body);

    res.status(200).send({
      isArticleParseable,
      emailReaderView,
    });
    return;
  }

  const [endPageHtml, endPageHtmlError] = await doAsyncThing(() =>
    fetch(endPageUrl).then((r) => r.text())
  );

  if (!endPageHtml || endPageHtmlError) {
    res.status(500).send({
      message: "Error while fetching URL content",
      error: endPageHtmlError,
    });
    return;
  }

  const readerView = reader(endPageHtml, endPageUrl);

  res.status(200).send({
    isArticleParseable,
    readerView,
  });
};

export default parseEmail;
