import fetch from "isomorphic-unfetch";

const REQUEST_URI = true ? `http://localhost:3001/api/index` : "";

const itemContent = async (req, res) => {
  if (req.method !== "PUT") {
    res.status(400).send(null);
    return;
  }

  let id;
  let url;

  console.log(req.body.id);

  try {
    const bodyJson = JSON.parse(req.body);
    id = bodyJson.id;
    url = bodyJson.url;
  } catch (error) {
    void error;
  }

  //   const { id, url } = req.body;

  if (!url || !id) {
    res.status(400).send({
      message: "Expected request body to contain url and id properties.",
      provided: {
        id,
        url,
      },
    });
    return;
  }

  const contentResponse = await fetch(REQUEST_URI, {
    method: "PUT",
    body: JSON.stringify({
      url,
      id,
    }),
  });

  const contentJson = await contentResponse.json();

  console.log(contentJson);

  res.status(200).send({
    message: `Success.`,
    content: contentJson,
  });
};

export default itemContent;
