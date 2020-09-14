import { mutate } from "swr";
import { useCallback } from "react";
import gql from "gql-tag";
import { useAuthedSWR } from "../lib/requestHooks";
import { gqlFetcherFactory } from "../lib/fetcherFactories";
import ReactiveItemData from "./reactiveItemData";

const Data = ({ itemId }) => {
  const query = gql`
    query {
      findItemByID(id: ${itemId}) {
        url
      }
      clipsByItemId(itemId: "${itemId}") {
        data {
          text
          _id
        }
      }
    }
  `;

  const { data, error, isValidating } = useAuthedSWR(query, gqlFetcherFactory);

  const invalidateQuery = useCallback(() => {
    mutate(query);
  });

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ReactiveItemData
        url={data.data.findItemByID.url}
        itemId={itemId}
        clips={data.data.clipsByItemId.data}
        invalidateQuery={invalidateQuery}
      />
    </>
  );
};

export default Data;
