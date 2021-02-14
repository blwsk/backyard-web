import gql from "gql-tag";
import { useGraphql } from "../lib/requestHooks";
import ReactiveItemData from "./reactiveItemData";

const getOriginEmailBody = (data) => {
  try {
    return data.data.legacyItem.origin.emailBody;
  } catch (error) {
    return null;
  }
};

const Data = ({ itemId }: { itemId: string }) => {
  const query = gql`
    query($itemId: ID!) {
      legacyItem(id: $itemId) {
        id
        url
        createdBy
        createdAt
        content {
          body
          title
          metaTitle
          metaDescription
          json
        }
        origin {
          rssFeedUrl
          emailBody
        }
        clips {
          text
          id
        }
      }
    }
  `;

  const variables = {
    itemId,
  };

  const { data, mutate } = useGraphql<any>({
    query,
    variables,
  });

  if (!data) {
    return <div>Loading...</div>;
  }

  // 404
  if (!data.data.legacyItem) {
    return (
      <div>
        <h1>404</h1>
        <p>{`We looked for item #${itemId}, but couldn't find it.`}</p>
      </div>
    );
  }

  return (
    <ReactiveItemData
      url={data.data.legacyItem.url}
      content={data.data.legacyItem.content}
      itemId={itemId}
      modernItemId={data.data.legacyItem.id}
      clips={data.data.legacyItem.clips}
      originEmailBody={getOriginEmailBody(data)}
      invalidateQuery={mutate}
    />
  );
};

export default Data;
