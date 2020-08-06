import fetch from "isomorphic-unfetch";

const { FAUNADB_SECRET: secret } = process.env;

const graphql = async (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  const gqlResponse = await fetch("https://graphql.fauna.com/graphql", {
    method: "POST",
    body: JSON.stringify(req.body),
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  });

  const json = await gqlResponse.json();

  res.status(gqlResponse.status).send(json);
};

export default graphql;
