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
      : "https://backyard.vercel.app";
  return baseUrl;
};

const fetcherBase = (path, options) => {
  return fetch(`${getBaseUrl()}${path}`, options).then((res) => {
    if (res.status >= 400) {
      return Promise.reject(res);
    } else {
      return res;
    }
  });
};

const absolutePathFetcher = fetch;

const jsonParser = (res) => res.json();

export const jsonFetcherFactory = ({
  getAccessTokenSilently,
  absolutePath = false,
  options: factoryFunctionOptions = {},
}) => (path, options = {}) => {
  const fetcherFn = absolutePath ? absolutePathFetcher : fetcherBase;

  const optionsToPass = {
    ...options,
    ...factoryFunctionOptions,
  };

  return getAccessTokenSilently()
    .then((token) => {
      return fetcherFn(path, {
        ...optionsToPass,
        headers: {
          ...(optionsToPass.headers ? optionsToPass.headers : {}),
          Authorization: `Bearer ${token}`,
        },
      }).catch((e) => Promise.reject(e));
    })
    .then(jsonParser);
};

export const gqlFetcherFactory = ({ getAccessTokenSilently, options = {} }) => (
  query
) => {
  return getAccessTokenSilently()
    .then((token) => {
      return fetch(`${getBaseUrl()}/api/graphql`, {
        ...options,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query,
        }),
      });
    })
    .then(jsonParser)
    .then((res) => {
      if (res && res.errors && res.errors.length > 0) {
        return Promise.reject(res);
      }
      return res;
    });
};
