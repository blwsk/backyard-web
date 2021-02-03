import { doAsyncThing } from "../doAsyncThing";
import unfetch from "isomorphic-unfetch";

const { BACKYARD_SERVER_SECRET } = process.env;

export const deleteItemsBulk = (legacyIds: string[]) => {
  return doAsyncThing(() => {
    return unfetch(
      process.env.NODE_ENV !== "development"
        ? "https://api.backyard.wtf/api/items"
        : "http://localhost:8081/api/items",
      {
        method: "DELETE",
        body: JSON.stringify([...legacyIds, "289516680180138502"]),
        headers: {
          Authorization: `Bearer ${BACKYARD_SERVER_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );
  });
};
