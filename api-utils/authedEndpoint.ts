import jwt from "jsonwebtoken";
import jwks, { JwksClient } from "jwks-rsa";

const KEY_SET_URI = `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/.well-known/jwks.json`;

const jwksClient: JwksClient = jwks({
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
  const { authorization: Authorization } = req.headers;

  const token = getTokenFromHeaderValue(Authorization);

  const decodedToken = jwt.decode(token, { complete: true });

  const {
    header: { alg, kid },
  } = decodedToken;

  const { getPublicKey } = await jwksClient.getSigningKeyAsync(kid);

  const isVerified = jwt.verify(token, getPublicKey(), { algorithms: [alg] });

  if (!isVerified) {
    res.status(401).send(null);
    return;
  }

  let userinfoRes;
  let err;
  try {
    userinfoRes = await fetch(
      `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/userinfo`,
      {
        headers: { Authorization },
      }
    );
  } catch (e) {
    err = e;
  }

  const user = await userinfoRes.json();

  return endpointFn(req, res, { user, err });
};

export default authedEndpoint;
