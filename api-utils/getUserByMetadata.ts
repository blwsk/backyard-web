import { query as q } from "faunadb";
import { doAsyncThing } from "./doAsyncThing";

interface UserMetadataInfo {
  emailIngestAddress?: string;
  phoneNumber?: string;
}

interface Auth0User {
  sub: string; // userId
}

const _getMatcher = (metadataInfo: UserMetadataInfo) => {
  if (metadataInfo.emailIngestAddress) {
    return q.Match(
      q.Index("userMetadataByEmailIngest"),
      metadataInfo.emailIngestAddress
    );
  }

  return q.Match(
    q.Index("userMetadataByPhoneNumber"),
    metadataInfo.phoneNumber
  );
};

export const getUserByMetadata = (
  faunaClient: any,
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
