import gql from "gql-tag";
import { makeGqlRequest } from "../../../api-utils/makeGqlRequest";
import { doAsyncThing } from "../../../api-utils/doAsyncThing";

interface Result {}

const query = gql`
  query {
    allItems(_size: 10000) {
      data {
        _id
        _ts
        url
        content {
          title
          metaTitle
          metaDescription
        }
      }
    }
  }
`;

const exportTextContent = async (req, res) => {
  const [allItems, allItemsError] = await doAsyncThing(() =>
    makeGqlRequest(JSON.stringify({ query }))
  );

  if (allItemsError) {
    res.status(500).send({
      error: allItemsError,
    });
    return;
  }

  const results: Result[] = allItems.data.allItems.data;

  res.status(200).send(results);
};

export default exportTextContent;
