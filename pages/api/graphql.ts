import authedEndpoint from "../../api-utils/authedEndpoint";
import { graphql as graphqlModern } from "../../api-utils/modern/graphql";

const graphql = authedEndpoint(async (req, res, { user, err }) => {
  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  if (err) {
    console.log("user brief error", err);
  }

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
  }

  console.log(JSON.stringify(gqlResponse));

  res.status(200).send(gqlResponse);
});

export default graphql;
