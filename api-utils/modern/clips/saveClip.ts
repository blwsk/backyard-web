import { doAsyncThing } from "../../doAsyncThing";
import unfetch from "isomorphic-unfetch";
import { Clip } from "../../../types/ClipTypes";

const { BACKYARD_SERVER_SECRET } = process.env;

export const saveClip = (
  { text, createdBy, createdAt, itemId }: Partial<Clip>,
  legacyId: string
) => {
  const body = {
    text,
    createdBy,
    createdAt,
    itemId,
    legacyId,
  };

  return doAsyncThing(() => {
    return unfetch(
      process.env.NODE_ENV !== "development"
        ? "https://api.backyard.wtf/api/clip"
        : "http://localhost:8081/api/clip",
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
