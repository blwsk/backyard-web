import unfetch from "isomorphic-unfetch";

const { BACKYARD_SERVER_SECRET } = process.env;

export const graphql = async ({
  query,
  variables,
  userId,
}: {
  query: string;
  variables: object;
  userId: string;
}) => {
  let gqlResponse;
  let gqlError;

  try {
    gqlResponse = await unfetch(
      process.env.NODE_ENV !== "development"
        ? "https://backyard.up.railway.app/graphql"
        : "http://localhost:8081/graphql",
      {
        method: "POST",
        body: JSON.stringify({
          query,
          variables: {
            ...variables,
            userId,
          },
        }),
        headers: {
          Authorization: `Bearer ${BACKYARD_SERVER_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    ).then((gqlRes) => gqlRes.json());
  } catch (error) {
    gqlError = error;
    console.error(error);
  }

  return [gqlResponse, gqlError];
};
