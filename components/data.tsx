import { mutate } from "swr";
import gql from "gql-tag";
import { useAuthedSWR } from "../lib/requestHooks";
import { gqlFetcherFactory } from "../lib/fetcherFactories";
import ReactiveItemData from "./reactiveItemData";

const Data = ({ itemId }) => {
  const query = gql`
    query {
      findItemByID(id: ${itemId}) {
        url
        content {
          body
          title
          metaTitle
          metaDescription
          json
        }
      }
      clipsByItemId(itemId: "${itemId}") {
        data {
          text
          _id
        }
      }
    }
  `;

  const { data } = useAuthedSWR(query, gqlFetcherFactory);

  const invalidateQuery = () => {
    mutate(query);
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  // 404
  if (!data.data.findItemByID) {
    return (
      <div>
        <h1>404</h1>
        <p>{`We looked for item #${itemId}, but couldn't find it.`}</p>
      </div>
    );
  }

  return (
    <>
      <ReactiveItemData
        url={data.data.findItemByID.url}
        content={data.data.findItemByID.content}
        itemId={itemId}
        clips={data.data.clipsByItemId.data}
        invalidateQuery={invalidateQuery}
      />
    </>
  );
};

export default Data;
