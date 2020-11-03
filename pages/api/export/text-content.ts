import gql from "gql-tag";
import { makeGqlRequest } from "../../../api-utils/makeGqlRequest";
import { doAsyncThing } from "../../../api-utils/doAsyncThing";
import { ItemExportData } from "../../../types/ExportTypes";

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
          body
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

  const allItemObjects = allItems.data.allItems.data;

  const cleanedObjects = allItemObjects.map((r) => {
    /**
     * Strip too-large bodies
     *
     * See https://www.algolia.com/doc/faq/basics/is-there-a-size-limit-for-my-index-records/
     */
    if (Buffer.byteLength(JSON.stringify(r)) >= 100000 /* bytes */) {
      return {
        ...r,
        content: {
          ...r.content,
          body: null,
          metaDescription: null,
        },
      };
    }

    return r;
  });

  const results: ItemExportData[] = cleanedObjects.map(
    (r): ItemExportData => ({
      ...r,
      objectID: r._id,
    })
  );

  res.status(200).send(results);
};

export default exportTextContent;
