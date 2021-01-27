import useSWR from "swr";
import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";
import {
  JsonFetcherFactoryOptions,
  jsonParser,
  getBaseUrl,
  GqlResponseJson,
} from "./fetcherFactories";
import unfetch from "isomorphic-unfetch";

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

const createGraphqlKey = ({
  query,
  variables,
}: {
  query: string;
  variables: object;
}): string => {
  return JSON.stringify({
    query,
    variables,
  });
};

export const useGraphql = ({
  query,
  variables,
}: {
  query: string;
  variables: object;
}): any => {
  const { getAccessTokenSilently: _getAccessTokenSilently, user } = useAuth0();

  const getAccessTokenSilently = () =>
    _getAccessTokenSilently({
      audience: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/api/v2/`,
      scope: "openid profile offline_access",
    });

  const key = createGraphqlKey({
    query,
    variables: { ...variables, userId: user.sub },
  });

  const result = useSWR(
    key,
    () => {
      return getAccessTokenSilently()
        .then(
          (token: string): Promise<Response> => {
            return unfetch(`${getBaseUrl()}/api/graphql?v=2`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: key,
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
    },
    { revalidateOnFocus: false, refreshInterval: 60 * 60 * 1000 }
  );

  return result;
};
