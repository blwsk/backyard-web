import unfetch from "isomorphic-unfetch";
import authedEndpoint from "../../api-utils/authedEndpoint";

const { FAUNADB_SECRET: secret, BACKYARD_SERVER_SECRET } = process.env;

const graphql = authedEndpoint(async (req, res, { user, err }) => {
  const v2 = req.query.v === "2";

  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  if (v2) {
    if (err) console.log(err);

    let gqlResponse;
    let gqlError;

    const { query, variables } = req.body;

    try {
      gqlResponse = await unfetch(
        "https://api.backyard.wtf/graphql",
        // "http://localhost:8081/graphql",
        {
          method: "POST",
          body: JSON.stringify({ query, variables }),
          headers: {
            Authorization: `Bearer ${BACKYARD_SERVER_SECRET}`,
            "Content-Type": "application/json",
          },
        }
      ).then((gqlRes) => gqlRes.json());
    } catch (error) {
      gqlError = error;
    }

    if (gqlError) {
      res.status(400).send({
        error: gqlError,
      });
      return;
    }

    res.status(200).send(gqlResponse);
    return;
  }

  /**
   * Pass user as a graphql variable
   */

  const { sub: userId } = user;

  if (err) console.log(err);

  const gqlResponse = await fetch("https://graphql.fauna.com/graphql", {
    method: "POST",
    body: JSON.stringify({ ...req.body, variables: { userId } }),
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  });

  const json = await gqlResponse.json();

  res.status(gqlResponse.status).send(json);
});

export default graphql;
