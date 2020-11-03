import { reader } from "./reader";
import { doAsyncThing } from "./doAsyncThing";

export const fetchTextContent = async ({
  url,
}): Promise<{ result: any; error: Error }> => {
  let result;
  let error;

  try {
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

    if (urlHtmlError) {
      throw Object.assign({}, new Error(), urlHtmlError);
    }

    result = reader(urlHtml, url);
  } catch (err) {
    error = err;
  }

  return { result, error };
};
