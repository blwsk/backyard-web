import { query as q } from "faunadb";
import { doAsyncThing } from "./doAsyncThing";

export interface UserMetadataUpdate {
  emailIngestAddress?: string;
  emailIngestWebhookId?: string;
  phoneNumber?: string;
}

interface Auth0User {
  sub: string; // userId
}

export const updateUserMetadata = (
  faunaClient: any,
  user: Auth0User,
  metadataUpdate: UserMetadataUpdate
) =>
  doAsyncThing(() =>
    faunaClient.query(
      q.Let(
        {
          userMetadata: q.Let(
            {
              userMetadataMaybe: q.Paginate(
                q.Match(q.Index("userMetadataForUser"), user.sub),
                { size: 1 }
              ),
            },
            q.If(
              q.IsEmpty(q.Var("userMetadataMaybe")),
              q.Create(q.Collection("UserMetadata"), {
                data: {
                  userId: user.sub,
                },
              }),
              q.Reduce(
                q.Lambda(["acc", "item"], q.Get(q.Var("item"))),
                null,
                q.Select("data", q.Var("userMetadataMaybe"))
              )
            )
          ),
        },
        q.Update(q.Select("ref", q.Var("userMetadata")), {
          data: metadataUpdate,
        })
      )
    )
  );
