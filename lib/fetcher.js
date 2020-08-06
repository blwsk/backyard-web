import fetch from "isomorphic-unfetch";

const getBaseUrl = () => {
  const isProcessDev = process.env.NODE_ENV === "development";
  const isBrowserDev =
    window &&
    window.location &&
    window.location.href &&
    !!window.location.href.indexOf("localhost");

  const baseUrl =
    isProcessDev || isBrowserDev
      ? `${window.location.protocol}//${window.location.host}`
      : "https://backyard.blwsk.vercel.app";
  return baseUrl;
};

export const fetcherBase = (path, options) => {
  return fetch(`${getBaseUrl()}${path}`, options);
};

export const textParser = (res) => res.text();

export const jsonParser = (res) => res.json();

export const textFetcher = (...args) => fetcherBase(...args).then(textParser);

export const jsonFetcher = (...args) => fetcherBase(...args).then(jsonParser);

export const gqlFetcher = (fragment) => (path) => {
  return fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: fragment }),
  })
    .then(jsonParser)
    .then((res) => {
      if (res && res.errors && res.errors.length > 0) {
        return Promise.reject(res);
      }
      return res;
    });
};
