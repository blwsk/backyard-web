import { doAsyncThing } from "../../doAsyncThing";
import unfetch from "isomorphic-unfetch";
import { Item } from "../../../types/ItemTypes";

const { BACKYARD_SERVER_SECRET } = process.env;

export const saveItem = ({
  url,
  createdAt,
  createdBy,
  source,
  content,
  origin,
  legacyId,
}: Partial<Item>) => {
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
        ? "https://backyard.up.railway.app/api/item"
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
