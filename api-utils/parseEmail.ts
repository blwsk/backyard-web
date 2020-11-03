import { reader, getEndPageUrl, ReaderView } from "./reader";
import { doAsyncThing } from "./doAsyncThing";

export const parseEmail = async (
  emailBody: string,
  subject: string
): Promise<{
  isArticleParseable?: boolean;
  readerView?: ReaderView;
  emailReaderView?: ReaderView;
  error?: Error;
}> => {
  const endPageUrl = await getEndPageUrl(emailBody, subject);

  const isArticleParseable = !!endPageUrl;

  if (!isArticleParseable) {
    const emailReaderView = reader(emailBody);

    return {
      isArticleParseable,
      emailReaderView,
    };
  }

  const [endPageHtml, endPageHtmlError] = await doAsyncThing(() =>
    fetch(endPageUrl).then((r) => r.text())
  );

  if (!endPageHtml || endPageHtmlError) {
    return {
      error: endPageHtmlError,
    };
  }

  const readerView = reader(endPageHtml, endPageUrl);

  return {
    isArticleParseable,
    readerView,
  };
};
