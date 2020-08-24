import Header from "../components/header";
import Wrapper from "../components/wrapper";
import useSWR from "swr";
import gql from "gql-tag";
import { gqlFetcher } from "../lib/fetcher";
import ListItem from "../components/listItem";

const SelectionList = () => {
  const { data, error, isValidating } = useSWR(
    gql`
      query {
        allTextSelections {
          data {
            item {
              url
              _id
              _ts
            }
            text
            _id
          }
        }
      }
    `,
    gqlFetcher
  );

  if (!data) {
    return <div>Loading...</div>;
  }

  const textSelections = data.data.allTextSelections.data;

  if (textSelections.length === 0) {
    <div>Save text selections and view them here.</div>;
  }

  return (
    <div>
      {textSelections.map((selection) => {
        const { item, text, _id } = selection;

        return (
          <div key={_id} className="selection-item">
            <ListItem item={item} />
            <blockquote>{text}</blockquote>
          </div>
        );
      })}
      <style jsx>{`
        .selection-item {
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

const Selections = () => {
  return (
    <div>
      <Header />
      <Wrapper>
        <h1>Selections</h1>
        <SelectionList />
      </Wrapper>
    </div>
  );
};

export default Selections;
