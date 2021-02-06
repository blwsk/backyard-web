import { doAsyncThing } from "../../doAsyncThing";
import unfetch from "isomorphic-unfetch";
import { Item } from "../../../types/ItemTypes";

const { BACKYARD_SERVER_SECRET } = process.env;

export const saveItem = (
  { url, createdAt, createdBy, source, content, origin }: Item,
  legacyId: string
) => {
  const body = {
    url,
    createdAt,
    createdBy,
    source,
    content,
    origin,
    legacyId,
  };

  return doAsyncThing(() => {
    return unfetch(
      process.env.NODE_ENV !== "development"
        ? "https://api.backyard.wtf/api/item"
        : "http://localhost:8081/api/item",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          Authorization: `Bearer ${BACKYARD_SERVER_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );
  });
};
