import unfetch from "isomorphic-unfetch";

export const getBaseUrl = () => {
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

const fetcherBase = (path: string, options: object): Promise<Response> => {
  return unfetch(`${getBaseUrl()}${path}`, options).then((res) => {
    if (res.status >= 400) {
      return Promise.reject(res);
    } else {
      return res;
    }
  });
};

export const jsonParser = (res: Response): Promise<object> => res.json();

type Method = "GET" | "PUT" | "POST" | "DELETE";

export interface JsonFetcherFactoryOptions {
  method?: Method;
  body?: string;
}

interface JsonFetcherFactoryProps {
  getAccessTokenSilently: Function;
  options?: JsonFetcherFactoryOptions;
}

export const jsonFetcherFactory = ({
  getAccessTokenSilently,
  options: factoryFunctionOptions = {},
}: JsonFetcherFactoryProps) => (path, options = {}) => {
  const fetcherFn = fetcherBase;

  const optionsToPass: any = {
    ...options,
    ...factoryFunctionOptions,
  };

  return getAccessTokenSilently()
    .then(
      (token: string): Promise<Response> => {
        return fetcherFn(path, {
          ...optionsToPass,
          headers: {
            ...(optionsToPass.headers ? optionsToPass.headers : {}),
            Authorization: `Bearer ${token}`,
          },
        }).catch((e) => Promise.reject(e));
      }
    )
    .then(jsonParser);
};

export interface GqlResponseJson {
  data: object;
  errors?: object[];
}

export const gqlFetcherFactory = ({ getAccessTokenSilently, options = {} }) => (
  query
) => {
  return getAccessTokenSilently()
    .then(
      (token: string): Promise<Response> => {
        return unfetch(`${getBaseUrl()}/api/graphql`, {
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
      }
    )
    .then(jsonParser)
    .then(
      (gqlResponse: GqlResponseJson): Promise<GqlResponseJson> => {
        if (
          gqlResponse &&
          gqlResponse.errors &&
          gqlResponse.errors.length > 0
        ) {
          return Promise.reject(gqlResponse);
        }
        return Promise.resolve(gqlResponse);
      }
    );
};
