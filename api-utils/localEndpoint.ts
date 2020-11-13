import { NextApiRequest, NextApiResponse } from "next";

const isLocal = process.env.NODE_ENV === "development";

const localEndpoint = (
  endpointFn: (req: NextApiRequest, res: NextApiResponse) => void
) => async (req, res) => {
  if (!isLocal) {
    res.status(401).send(null);
    return;
  }

  return endpointFn(req, res);
};

export default localEndpoint;
