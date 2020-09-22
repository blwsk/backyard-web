import authedEndpoint from "../../api-utils/authedEndpoint";

const fileUpload = authedEndpoint(async (req, res, { user, err: userErr }) => {
  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  res.status(200).send({});
});

export default fileUpload;
