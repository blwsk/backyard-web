import useSWR from "swr";
import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";

export const useAuthedSWR = (key, fetcherFactory) => {
  const { getAccessTokenSilently: _getAccessTokenSilently } = useAuth0();

  const getAccessTokenSilently = () =>
    _getAccessTokenSilently({
      audience: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/api/v2/`,
      scope: "openid profile offline_access",
    });

  const result = useSWR(key, fetcherFactory({ getAccessTokenSilently }));

  return result;
};

export const useAuthedCallback = (key, options, fetcherFactory) => {
  const { getAccessTokenSilently: _getAccessTokenSilently } = useAuth0();

  const getAccessTokenSilently = () =>
    _getAccessTokenSilently({
      audience: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/api/v2/`,
      scope: "openid profile offline_access",
    });

  const callback = useCallback(() => {
    return fetcherFactory({ getAccessTokenSilently })(key, options);
  }, [key, options]);

  return callback;
};