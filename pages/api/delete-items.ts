import authedEndpoint from "../../api-utils/authedEndpoint";
import { deleteItemsBulk } from "../../api-utils/modern/items/deleteItemsBulk";

const deleteItems = authedEndpoint(async (req, res) => {
  if (req.method !== "DELETE") {
    res.status(400).send(null);
    return;
  }

  let ids = [];

  try {
    ids = JSON.parse(req.body);
  } catch (error) {
    void error;
  }

  if (ids.length === 0) {
    res.status(400).send({
      message:
        "Expected request body with array of id strings. None was provided.",
    });
    return;
  }

  const [dualDeleteResult, dualDeleteError] = await deleteItemsBulk(ids);

  void dualDeleteResult;

  if (dualDeleteError) {
    res.status(500).send({
      error: dualDeleteError,
    });
    return;
  }

  res.status(200).send({
    message: "Success. The provided id(s) have been deleted.",
    ids,
    result: JSON.stringify(dualDeleteResult),
  });
});

export default deleteItems;
