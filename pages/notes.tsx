import Header from "../components/header";
import Wrapper from "../components/wrapper";
import gql from "gql-tag";
import {
  useState,
  useEffect,
  SyntheticEvent,
  useCallback,
  useMemo,
} from "react";
import requireAuth from "../lib/requireAuth";
import { useGraphql, useGraphqlMutationFactory } from "../lib/requestHooks";
import Button from "../components/ui/Button";
import TextArea from "../components/ui/TextArea";
import { throttle } from "../lib/throttle";

const PAGE_LENGTH = 50;

const getResultObject = (result) => result.notes;

const Note = ({ text, id }: { text: string; id: string }) => {
  const [localText, updateLocalText] = useState(null);

  const onChange = useGraphqlMutationFactory();

  const cb = useCallback((e) => {
    const next = e.target.value;
    console.log(next);
    updateLocalText(next);
  }, []);

  const persistUpdate = useMemo(
    () =>
      throttle((nextText) => {
        if (nextText === null) {
          return;
        }
        onChange({
          query: `
    mutation ($id: ID!, $userId: String!, $text: String!) {
        updateNote(id: $id, userId: $userId, text: $text) {
            id
            text
            createdAt
            createdBy
        }
} 
  `,
          variables: {
            id,
            text: nextText,
            // userId provided by serverless function
          },
        });
        //   .then(() => {
        //     debugger;
        //   })
        //   .catch(() => {
        //     debugger;
        //   });
      }, 3000),
    []
  );

  useEffect(() => {
    persistUpdate(localText);
  }, [localText]);

  return (
    <div key={id} className="selection-item">
      <TextArea
        onChange={cb}
        value={localText !== null ? localText : text}
        className="w-full"
      />
    </div>
  );
};

const Page = ({ results }) => {
  return (
    <>
      {results.map((clip) => {
        const { text, id } = clip;

        return <Note key={id} text={text} id={id} />;
      })}
    </>
  );
};

const PageList = ({ pages }) => {
  return (
    <>
      {pages.map((page) => {
        const { results, next } = getResultObject(page);

        return <Page key={next} results={results} />;
      })}
    </>
  );
};

const NoteList = () => {
  const [cursor, updateCursor] = useState<string>(null);

  const [pages, updatesPages] = useState([]);

  const { data, error, isValidating } = useGraphql<any>({
    query: gql`
      query (
        $size: Int
        $cursor: ID
        $userId: String!
        $sortOrder: SortOrder!
      ) {
        notes(
          size: $size
          cursor: $cursor
          userId: $userId
          sortOrder: $sortOrder
        ) {
          results {
            id
            text
            createdAt
            updatedAt
          }
          next
        }
      }
    `,
    variables: {
      size: PAGE_LENGTH,
      cursor: cursor ? cursor : undefined,
      sortOrder: "DESC",
      // userId will be provided in the serverless function
    },
  });

  const onLoadMoreClick = () => {
    updateCursor(getResultObject(data.data).next);
  };

  useEffect(() => {
    if (data && pages.length === 0) {
      /**
       * First page
       */
      updatesPages([data.data]);
      return;
    }

    if (data && !isValidating && typeof cursor === "string") {
      /**
       * Subsequent pages
       */
      updatesPages([...pages, data.data]);
      return;
    }
  }, [data, cursor]);

  const hasMore = data && typeof getResultObject(data.data).next === "string";

  return (
    <div>
      <PageList pages={pages} />
      <div style={{ height: 100 }}>
        {data ? (
          hasMore ? (
            <div className="m-y-4">
              <Button onClick={onLoadMoreClick}>Load more</Button>
            </div>
          ) : (
            <div className="m-y-4">
              <div>All caught up.</div>
            </div>
          )
        ) : (
          <div className="m-y-4">
            <div>Loading...</div>
          </div>
        )}
        {error && <div>{JSON.stringify(error)}</div>}
      </div>
    </div>
  );
};

const Notes = () => {
  return (
    <div>
      <Header />
      <Wrapper>
        <h1>Notes</h1>
        <NoteList />
      </Wrapper>
      <style jsx global>{`
        .selection-item {
          margin-bottom: 16px;
        }
        .selection-item:last-of-type {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default requireAuth(Notes);
