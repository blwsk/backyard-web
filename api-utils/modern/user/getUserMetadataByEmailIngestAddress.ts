import { doAsyncThing } from "../../doAsyncThing";
import unfetch from "isomorphic-unfetch";
import { UserMetadata } from "../../../types/UserMetadataTypes";

const { BACKYARD_SERVER_SECRET } = process.env;

export const getUserMetadataByEmailIngestAddress = ({
  emailIngestAddress,
}: {
  emailIngestAddress: string;
}): Promise<[UserMetadata | null, Error | null, string]> => {
  return doAsyncThing(() => {
    return unfetch(
      process.env.NODE_ENV !== "development"
        ? `https://api.backyard.wtf/api/user/email?emailIngestAddress=${emailIngestAddress}`
        : `http://localhost:8081/api/user/email?emailIngestAddress=${emailIngestAddress}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${BACKYARD_SERVER_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());
  });
};
