import authedEndpoint from "../../api-utils/authedEndpoint";
import { graphql as graphqlModern } from "../../api-utils/modern/graphql";

const { FAUNADB_SECRET: secret, BACKYARD_SERVER_SECRET } = process.env;

const graphql = authedEndpoint(async (req, res, { user, err }) => {
  const v2 = req.query.v === "2";

  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  if (v2) {
    if (err) console.log(err);

    const { query, variables } = req.body;

    const [gqlResponse, gqlError] = await graphqlModern({
      userId: user.sub,
      query,
      variables,
    });

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
