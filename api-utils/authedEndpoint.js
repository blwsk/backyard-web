import jwt from "jsonwebtoken";

const { AUTH0_SECRET_KEY: secret } = process.env;

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

const verifyJwt = async (authorizationHeaderValue) => {
  return new Promise((resolve, reject) => {
    const token = getTokenFromHeaderValue(authorizationHeaderValue);

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

const authedEndpoint = (endpointFn) => async (req, res) => {
  const {
    Authorization = "Bearer 1ysnjcl8jacQHeTaxynUUeDGor4-KUXM",
  } = req.headers;
  let isVerified;
  try {
    const decoded = await verifyJwt(Authorization);
    console.log(decoded);
    isVerified = true;
  } catch (error) {
    console.log(error);
    isVerified = false;
  }

  if (!isVerified) {
    res.status(401).send(null);
    return;
  }

  return endpointFn(req, res);
};

export default authedEndpoint;
