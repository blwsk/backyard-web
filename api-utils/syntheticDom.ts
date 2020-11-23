import { JSDOM } from "jsdom";

export const getDom = (html: string, url?: string) => {
  const dom = new JSDOM(html, url ? { url } : undefined);

  return dom.window.document;
};
