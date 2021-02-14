import { doAsyncThing } from "../../doAsyncThing";
import unfetch from "isomorphic-unfetch";

const { BACKYARD_SERVER_SECRET } = process.env;

export const confirm = ({
  phoneNumber,
  userId,
  pin,
}: {
  phoneNumber: string;
  userId: string;
  pin: string;
}) => {
  const body = {
    phoneNumber,
    userId,
    pin,
  };

  return doAsyncThing(() => {
    return unfetch(
      process.env.NODE_ENV !== "development"
        ? "https://api.backyard.wtf/api/sms/confirm"
        : "http://localhost:8081/api/sms/confirm",
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
