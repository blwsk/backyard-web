import { Readability } from "@mozilla/readability";
import FuzzySet from "fuzzyset.js";
import { findEndPageUrl } from "./puppeteerUtils";
import { getDom } from "./syntheticDom";

export const getMetaProperties = (
  document
): {
  title?: string;
  url?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
} => {
  const titleNode = document.querySelector("title");
  const metaUrlNode = document.querySelector("meta[property='og:url']");
  const metaTitleNode = document.querySelector("meta[property='og:title']");
  const metaDescriptionNode = document.querySelector(
    "meta[property='og:description']"
  );
  const canonicalUrlNode = document.querySelector("link[rel='canonical']");

  return {
    title: titleNode ? titleNode.text : null,
    url: metaUrlNode ? metaUrlNode.content : null,
    metaTitle: metaTitleNode ? metaTitleNode.content : null,
    metaDescription: metaDescriptionNode ? metaDescriptionNode.content : null,
    canonicalUrl: canonicalUrlNode ? canonicalUrlNode.href : null,
  };
};

const getAnchors = (document: Document): object => {
  let links = {};
  document.querySelectorAll("a").forEach((el) => {
    const key = el.text ? el.text.trim() : el.text;
    links[key] = el.href;
  });
  return links;
};

const getFirstAnchorHref = (document: Document): string => {
  const links = getAnchors(document);

  const keys = Object.keys(links);

  if (keys.length > 0) {
    return links[keys[0]];
  }

  return null;
};

const getSubjectLinkMatch = (document: Document, subject: string): string => {
  const links = getAnchors(document);

  const keys = Object.keys(links);

  const searchableSet = FuzzySet(keys);

  const match = searchableSet.get(subject);

  if (match && match[0] && match[0][0] > 0.75) {
    console.log("Subject link match", match[0]);
    const key = match[0][1];

    return links[key];
  }

  return null;
};

const getViewInBrowserUrl = (document: Document): string => {
  const links = getAnchors(document);
  const keys = Object.keys(links);

  const searchableSet = FuzzySet(keys);

  const match = searchableSet.get("view in browser");

  if (match && match[0] && match[0][0] > 0.75) {
    console.log("View in browser match", match[0]);
    const key = match[0][1];

    return links[key];
  }

  return null;
};

export const getEndPageUrl = async (
  html: string,
  subject: string
): Promise<string> => {
  const document = getDom(html);

  const subjectLinkMatch = getSubjectLinkMatch(document, subject);

  const viewInBrowserUrl = getViewInBrowserUrl(document);

  const firstAnchorHref = getFirstAnchorHref(document);

  const url = subjectLinkMatch || viewInBrowserUrl || firstAnchorHref;

  let endPageUrl, endPageUrlError;

  try {
    endPageUrl = url ? await findEndPageUrl(url) : null;
  } catch (error) {
    console.error("End page URL error", { error });
    endPageUrlError;
  }

  console.log("End page URL", {
    subjectLinkMatch,
    viewInBrowserUrl,
    firstAnchorHref,
    endPageUrl,
  });

  return endPageUrl;
};

export interface ReaderView {
  title?: string;
  url?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  body?: string;
  textContent?: string;
  length?: number;
  siteName?: string;
}

export const reader = (html: string, url?: string): ReaderView => {
  const document = getDom(html, url);

  const properties = getMetaProperties(document);

  const reader = new Readability(document);

  const parsed = reader ? reader.parse() : null;

  console.log("Reader", {
    properties,
  });

  const urlToPass = (parsed && parsed.url) || properties.url || url;

  return {
    // from document tags
    title: properties.title,
    metaTitle: properties.metaTitle,
    metaDescription: properties.metaDescription,
    canonicalUrl: properties.canonicalUrl,

    // from readability parse result
    url: urlToPass,
    ...(parsed && {
      body: parsed.content,
      textContent: parsed.textContent,
      length: parsed.length,
      siteName: parsed.siteName,
    }),
  };
};
