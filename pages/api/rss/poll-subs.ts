import { serverToServerEndpoint } from "../../../api-utils/authedEndpoint";

const pollSubscriptions = serverToServerEndpoint(async (req, res) => {
  res.status(200).send({
    message: `Polled subscriptions at ${new Date().toLocaleString()}`,
  });
});

export default pollSubscriptions;
