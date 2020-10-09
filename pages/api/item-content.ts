import fetch from "isomorphic-unfetch";

const REQUEST_URI =
  process.env.NODE_ENV === "development"
    ? `http://localhost:3001/api/index`
    : "https://backyard-data.vercel.app/api/index";

const itemContent = async (req, res) => {
  if (req.method !== "PUT") {
    res.status(400).send(null);
    return;
  }

  let id;
  let url;

  try {
    const bodyJson = JSON.parse(req.body);
    id = bodyJson.id;
    url = bodyJson.url;
  } catch (error) {
    void error;
  }

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

  res.status(200).send({
    message: `Success.`,
    content: contentJson,
  });
};

export default itemContent;
