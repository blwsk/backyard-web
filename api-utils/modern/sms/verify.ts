import { doAsyncThing } from "../../doAsyncThing";
import unfetch from "isomorphic-unfetch";

const { BACKYARD_SERVER_SECRET } = process.env;

export const verify = ({
  phoneNumber,
  userId,
}: {
  phoneNumber: string;
  userId: string;
}) => {
  const body = {
    phoneNumber,
    userId,
  };

  return doAsyncThing(() => {
    return unfetch(
      process.env.NODE_ENV !== "development"
        ? "https://api.backyard.wtf/api/sms/verify"
        : "http://localhost:8081/api/sms/verify",
      {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
          Authorization: `Bearer ${BACKYARD_SERVER_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());
  });
};
