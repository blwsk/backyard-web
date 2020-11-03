import gql from "gql-tag";
import { makeGqlRequest } from "../../../api-utils/makeGqlRequest";
import { doAsyncThing } from "../../../api-utils/doAsyncThing";
import { ClipExportData } from "../../../types/ExportTypes";

const query = gql`
  query {
    allTextSelections(_size: 10000) {
      data {
        _id
        _ts
        text
        createdBy
        createdAt
        item {
          _id
        }
      }
    }
  }
`;

const exportTextContent = async (req, res) => {
  const [allTextSelections, allTextSelectionsError] = await doAsyncThing(() =>
    makeGqlRequest(JSON.stringify({ query }))
  );

  if (allTextSelectionsError) {
    res.status(500).send({
      error: allTextSelectionsError,
    });
    return;
  }

  const allTextSelectionsObjects =
    allTextSelections.data.allTextSelections.data;

  const results: ClipExportData[] = allTextSelectionsObjects.map(
    (r): ClipExportData => {
      const { _id, item, ...rest } = r;

      return {
        ...rest,
        _id,
        objectID: r._id,
        itemId: item ? item._id : null,
      };
    }
  );

  res.status(200).send(results);
};

export default exportTextContent;
