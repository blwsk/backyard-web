import authedEndpoint from "../../api-utils/authedEndpoint";
import { graphql as graphqlModern } from "../../api-utils/modern/graphql";

const graphql = authedEndpoint(async (req, res, { user, err }) => {
  console.log("req method", req.method);

  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  if (err) {
    console.log("user brief error", err);
  } else {
    console.log("user brief payload", user);
  }

  const { query, variables } = req.body;

  console.log("query + vars", query, variables);

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
});

export default graphql;
