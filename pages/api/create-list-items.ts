import fetch from "isomorphic-unfetch";
import faunadb, { query as q } from "faunadb";
import authedEndpoint from "../../api-utils/authedEndpoint";

const { FAUNADB_SECRET: secret } = process.env;

const client = new faunadb.Client({ secret });

type RequestBody = {
  ids?: string[];
  listId?: string;
};

const createListItems = authedEndpoint(
  async (req, res, { user, err: userErr }) => {
    if (req.method !== "POST") {
      res.status(400).send(null);
      return;
    }

    if (userErr || !(user && user.sub)) {
      res.status(401).send({
        message: "Authentication error.",
        error: "Missing user info",
      });
      return;
    }

    let bodyObject: RequestBody = {};

    try {
      bodyObject = JSON.parse(req.body);
    } catch (error) {
      void error;
    }

    const { ids = [], listId } = bodyObject;

    if (ids.length === 0 || typeof listId !== "string") {
      const errors = [];

      if (ids.length === 0) {
        errors.push("Array of ids is required to be non-empty");
      }
      if (typeof listId !== "string") {
        errors.push("listId of type string must be provided");
      }

      res.status(400).send({
        message: "Invalid request body.",
        errors,
      });
      return;
    }

    const refs = ids.map((id) => q.Ref(q.Collection("Item"), id));

    const listRef = q.Ref(q.Collection("List"), listId);

    let result;
    let error;
    try {
      result = await client.query(
        q.Foreach(
          refs,
          q.Lambda(
            "itemRef",
            q.Create(q.Collection("ListItem"), {
              data: {
                list: listRef,
                item: q.Var("itemRef"),
              },
            })
          )
        )
      );
    } catch (err) {
      error = err;
    }

    if (error) {
      res.status(500).send({
        error,
      });
      return;
    }

    res.status(200).send({
      message: `Success. The provided id(s) have been added to the list`,
      ids,
      listId,
      result: JSON.stringify(result),
    });
  }
);

export default createListItems;
