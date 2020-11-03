import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import FuzzySet from "fuzzyset.js";
import { findEndPageUrl } from "./puppeteerUtils";

export const getDom = (html: string, url?: string) => {
  const dom = new JSDOM(html, url ? { url } : undefined);

  const { document } = dom.window;

  return document;
};

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

const getViewInBrowserUrl = (document: Document): string => {
  let links = {};
  document.querySelectorAll("a").forEach((el) => {
    links[el.text] = el.href;
  });

  const keys = Object.keys(links);

  const searchableSet = FuzzySet(keys);

  const match = searchableSet.get("view in browser");

  if (match) {
    const key = match[0][1];

    return links[key];
  }

  return null;
};

const getSubjectLinkMatch = (document: Document, subject: string): string => {
  let links = {};
  document.querySelectorAll("a").forEach((el) => {
    links[el.text] = el.href;
  });

  const keys = Object.keys(links);

  const searchableSet = FuzzySet(keys);

  const match = searchableSet.get(subject);

  if (match) {
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

  const viewInBrowserUrl = getViewInBrowserUrl(document);

  const subjectLinkMatch = getSubjectLinkMatch(document, subject);

  const url = viewInBrowserUrl || subjectLinkMatch;

  const endPageUrl = url ? await findEndPageUrl(url) : null;

  return endPageUrl;
};

export const reader = (
  html: string,
  url?: string
): {
  title?: string;
  url?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  body?: string;
  textContent?: string;
  length?: number;
  siteName?: string;
} => {
  const document = getDom(html, url);

  const properties = getMetaProperties(document);

  const reader = new Readability(document);

  const parsed = reader ? reader.parse() : null;

  return {
    // from document tags
    title: properties.title,
    metaTitle: properties.metaTitle,
    metaDescription: properties.metaDescription,
    canonicalUrl: properties.canonicalUrl,

    // from readability parse result
    url: parsed.url || properties.url || url,
    body: parsed.content,
    textContent: parsed.textContent,
    length: parsed.length,
    siteName: parsed.siteName,
  };
};
