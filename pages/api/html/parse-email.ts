import { reader, getEndPageUrl } from "../../../api-utils/reader";
import { doAsyncThing } from "../../../api-utils/doAsyncThing";
import { parseEmail as parseEmailUtil } from "../../../api-utils/parseEmail";

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

  const {
    isArticleParseable,
    readerView,
    emailReaderView,
    error,
  } = await parseEmailUtil(body, subject);

  if (error) {
    res.status(500).send({
      message: "Email parsing error",
      error,
    });
    return;
  }

  if (isArticleParseable) {
    res.status(200).send({
      isArticleParseable,
      readerView,
    });
    return;
  }

  res.status(200).send({
    isArticleParseable,
    emailReaderView,
  });
};

export default parseEmail;
