const createEmailInbox = async (req, res) => {
  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  res.status(200).send({});
};

export default createEmailInbox;
