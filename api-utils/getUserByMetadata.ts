import { query as q, Client } from "faunadb";
import { doAsyncThing } from "./doAsyncThing";

interface UserMetadataInfo {
  emailIngestAddress?: string;
  phoneNumber?: string;
}

const _getMatcher = (metadataInfo: UserMetadataInfo) => {
  if (metadataInfo.emailIngestAddress) {
    return q.Match(
      q.Index("userMetadataByEmailIngest"),
      metadataInfo.emailIngestAddress
    );
  }

  if (metadataInfo.phoneNumber) {
    return q.Match(
      q.Index("userMetadataByPhoneNumber"),
      metadataInfo.phoneNumber
    );
  }

  throw new Error(
    "metadataInfo must include an indentifiable value defined in UserMetadataInfo"
  );
};

export const getUserByMetadata = (
  faunaClient: Client,
  metadataInfo: UserMetadataInfo
) =>
  doAsyncThing(() =>
    faunaClient.query(
      q.Let(
        {
          userMetadata: q.Let(
            {
              userMetadataMaybe: q.Paginate(_getMatcher(metadataInfo), {
                size: 1,
              }),
            },
            q.Reduce(
              q.Lambda(["acc", "item"], q.Get(q.Var("item"))),
              null,
              q.Select("data", q.Var("userMetadataMaybe"))
            )
          ),
        },
        q.Var("userMetadata")
      )
    )
  );
