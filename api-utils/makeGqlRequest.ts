import fetch from "isomorphic-unfetch";

const { FAUNADB_SECRET: secret } = process.env;

export const makeGqlRequest = async (body) => {
  const gqlResponse = await fetch("https://graphql.fauna.com/graphql", {
    method: "POST",
    body,
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  });

  const json = await gqlResponse.json();

  return json;
};
