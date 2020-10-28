import useSWR from "swr";
import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";
import { JsonFetcherFactoryOptions } from "./fetcherFactories";

export const useAuthedSWR = (key, fetcherFactory, options = {}) => {
  const { getAccessTokenSilently: _getAccessTokenSilently } = useAuth0();

  const getAccessTokenSilently = () =>
    _getAccessTokenSilently({
      audience: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/api/v2/`,
      scope: "openid profile offline_access",
    });

  const result = useSWR(
    key,
    fetcherFactory({ getAccessTokenSilently, options }),
    { revalidateOnFocus: false, refreshInterval: 60 * 60 * 1000 }
  );

  return result;
};

export const useAuthedCallback = (
  key: string,
  options: JsonFetcherFactoryOptions,
  fetcherFactory: Function
) => {
  const { getAccessTokenSilently: _getAccessTokenSilently } = useAuth0();

  const getAccessTokenSilently = () =>
    _getAccessTokenSilently({
      audience: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/api/v2/`,
      scope: "openid profile offline_access",
    });

  const callback = useCallback(
    (overrides = {}) => {
      return fetcherFactory({ getAccessTokenSilently })(key, {
        ...options,
        ...overrides,
      });
    },
    [key, options]
  );

  return callback;
};
