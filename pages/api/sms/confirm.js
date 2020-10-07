import authedEndpoint from "../../../api-utils/authedEndpoint";
import faunadb, { query as q } from "faunadb";

const { FAUNADB_SECRET: secret } = process.env;

const faunaClient = new faunadb.Client({ secret });

const validPin = (pin) => typeof pin === "string" && pin.length === 4;

const confirmPin = authedEndpoint(async (req, res, { user, err: userErr }) => {
  void userErr;

  if (req.method !== "POST") {
    res.status(400).send(null);
    return;
  }

  let bodyObject = {};

  try {
    bodyObject = JSON.parse(req.body);
  } catch (error) {
    void error;
  }

  const { pin } = bodyObject;

  if (typeof pin !== "string") {
    res.status(400).send({
      message: "Invalid request body",
      error: "Missing pin number",
    });
    return;
  }

  let findPinResult;
  let findPinError;
  try {
    findPinResult = await faunaClient.query(
      q.Let(
        {
          verifiersMaybe: q.Paginate(
            q.Match(q.Index("smsVerifiersByUser"), user.sub),
            { size: 1 }
          ),
        },
        q.If(
          q.IsEmpty(q.Var("verifiersMaybe")),
          [],
          q.Reduce(
            q.Lambda(["acc", "item"], q.Var("item")),
            null,
            q.Select("data", q.Var("verifiersMaybe"))
          )
        )
      )
    );
  } catch (err) {
    findPinError = err;
  }

  if (findPinError) {
    res.status(500).send({
      error: findPinError,
    });
    return;
  }

  const [expiresAt, pinFromDb, phoneNumber] = findPinResult;

  const expired = typeof expiresAt === "number" && Date.now() > expiresAt;

  if (expired) {
    res.status(400).send({
      message: `Pin has expired.`,
    });
    return;
  }

  const pinsMatch = validPin(pin) && validPin(pinFromDb) && pin === pinFromDb;

  if (!pinsMatch) {
    res.status(400).send({
      message: `Incorrect PIN.`,
    });
    return;
  }

  /**
   * Woohoo! We've validated the phone number. Time to record it in our DB as "verified".
   */

  res.status(200).send({
    message: `Success.`,
  });
});

export default confirmPin;
