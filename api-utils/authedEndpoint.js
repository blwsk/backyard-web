import jwt from "jsonwebtoken";
import jwks from "jwks-rsa";

const KEY_SET_URI = `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/.well-known/jwks.json`;

const jwksClient = jwks({
  jwksUri: KEY_SET_URI,
  cache: true,
});

const getTokenFromHeaderValue = (str) => {
  try {
    const parts = str.split(" ");
    if (parts[0] === "Bearer" && typeof parts[1] === "string") {
      return parts[1];
    }
  } catch (error) {
    void error;
  }

  return;
};

const authedEndpoint = (endpointFn) => async (req, res) => {
  const { authorization, Authorization } = req.headers;

  const token = getTokenFromHeaderValue(authorization || Authorization);

  const decodedToken = jwt.decode(token, { complete: true });

  const {
    header: { alg, kid },
  } = decodedToken;

  const { publicKey } = await jwksClient.getSigningKeyAsync(kid);

  const isVerified = jwt.verify(token, publicKey, { algorithms: [alg] });

  if (!isVerified) {
    res.status(401).send(null);
    return;
  }

  return endpointFn(req, res);
};

export default authedEndpoint;
