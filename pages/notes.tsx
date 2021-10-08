import Header from "../components/header";
import Wrapper from "../components/wrapper";
import gql from "gql-tag";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import requireAuth from "../lib/requireAuth";
import {
  useGraphql,
  useGraphqlMutation,
  useGraphqlMutationFactory,
} from "../lib/requestHooks";
import Button from "../components/ui/Button";
import { throttle } from "../lib/throttle";
import Timestamp from "../components/ui/Timestamp";

function findDiff(str1, str2) {
  let diff = "";
  str2.split("").forEach(function (val, i) {
    if (val != str1.charAt(i)) diff += val;
  });
  return diff;
}

const PAGE_LENGTH = 50;

const getResultObject = (result) => result.notes;

const DeleteNote = ({
  id,
  createdBy,
  removeNote,
}: {
  id: string;
  createdBy: string;
  removeNote: (id: string) => void;
}) => {
  const [clicked, updateClicked] = useState(false);

  const onDeleteNote = useGraphqlMutation({
    query: `
    mutation ($userId: String!, $id: ID!) {
        deleteNote(userId: $userId, id: $id)
    } 
    `,
    variables: {
      id,
      userId: createdBy,
      // userId is added by serverless function
    },
  });

  return clicked === false ? (
    <Button
      variant="secondary"
      size="small"
      onClick={() => updateClicked(true)}
    >
      Delete
    </Button>
  ) : (
    <span>
      Confirm:{" "}
      <Button
        variant="secondary"
        size="small"
        onClick={() =>
          onDeleteNote().then(() => {
            updateClicked(false);
            removeNote(id);
          })
        }
      >
        Delete
      </Button>
    </span>
  );
};

const Note = ({
  text,
  id,
  updatedAt,
  createdBy,
  removeNote,
}: {
  text: string;
  id: string;
  updatedAt: number;
  createdBy: string;
  removeNote: (id: string) => void;
}) => {
  const [localText, updateLocalText] = useState(null);

  const onChange = useGraphqlMutationFactory();

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
            updatedAt
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
      }, 3000),
    []
  );

  useEffect(() => {
    persistUpdate(localText);
  }, [localText]);

  const onInput = useCallback<(e: ContentEditableEvent) => void>(
    (e) => {
      const target = e.target;
      const next = target.value;

      const diff = localText && next ? findDiff(localText, next) : null;

      updateLocalText(next);

      console.log(diff);
    },
    [findDiff, localText]
  );

  const innerRef = useRef();

  return (
    <div className="note-item">
      <div className="mb-2 flex justify-between font-medium">
        <Timestamp ts={updatedAt} />
        <DeleteNote id={id} createdBy={createdBy} removeNote={removeNote} />
      </div>
      <ContentEditable
        innerRef={innerRef}
        html={localText !== null ? localText : text}
        onKeyDown={(e) => {
          if (e.keyCode === 9) {
            document.execCommand("insertHTML", false, "&nbsp;&nbsp;");
            e.preventDefault();
          }
        }}
        onChange={onInput}
        className="w-full p-2 border-2 border-gray-200 rounded"
      />
    </div>
  );
};

type Note = {
  id: string;
  text: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
};

const Page = ({ results }: { results: Note[] }) => {
  const [removed, updateRemoved] = useState<string[]>([]);

  const removeNote = useCallback(
    (id: string) => {
      updateRemoved([...removed, id]);
    },
    [removed]
  );

  return (
    <>
      {results
        .filter((note) => removed.indexOf(note.id) < 0)
        .sort((noteA, noteB) => parseInt(noteB.id) - parseInt(noteA.id))
        .map((note) => {
          const { text, id, updatedAt, createdBy } = note;

          return (
            <Note
              key={id}
              text={text}
              id={id}
              updatedAt={updatedAt}
              createdBy={createdBy}
              removeNote={removeNote}
            />
          );
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

type NotePage = {
  results: Note[];
  next?: string;
};

const NoteList = ({ newlyCreatedNotes }: { newlyCreatedNotes: Note[] }) => {
  const [cursor, updateCursor] = useState<string>(null);

  const [pages, updatesPages] = useState<{ notes: NotePage }[]>([]);

  const { data, error, isValidating } = useGraphql<{
    data: {
      notes: NotePage;
    };
  }>({
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
            createdBy
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

  useEffect(() => {
    if (newlyCreatedNotes.length > 0) {
      const firstPage = pages[0] || {
        notes: {
          results: [],
          next: "-1",
        },
      };

      updatesPages([
        {
          notes: {
            results: Array.from(
              new Set([...newlyCreatedNotes, ...firstPage.notes.results])
            ),
            next: firstPage.notes.next,
          },
        },
        ...pages.slice(1),
      ]);
    }
  }, [newlyCreatedNotes]);

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
          ) : pages.length > 1 ? (
            <div className="m-y-4">
              <div>All caught up.</div>
            </div>
          ) : null
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
  const [newlyCreatedNotes, updateNewlyCreatedNotes] = useState([]);

  const onCreateNote = useGraphqlMutation<{
    data: {
      createNote: Note;
    };
  }>({
    query: `
    mutation ($userId: String!, $text: String!) {
        createNote(userId: $userId, text: $text) {
            id
            text
            createdAt
            updatedAt
            createdBy
        }
    } 
    `,
    variables: {
      text: "",
      // userId is added by serverless function
    },
  });

  return (
    <div>
      <Header />
      <Wrapper>
        <div className="flex items-start justify-between">
          <h1 className="mt-0">Notes</h1>
          <Button
            className="my-2"
            onClick={() => {
              onCreateNote().then((createdNote) => {
                const {
                  data: { createNote: note },
                } = createdNote;

                updateNewlyCreatedNotes([...newlyCreatedNotes, note]);
              });
            }}
          >
            New
          </Button>
        </div>
        <NoteList newlyCreatedNotes={newlyCreatedNotes} />
      </Wrapper>
      <style jsx global>{`
        .note-item {
          margin-bottom: 20px;
        }
        .note-item:last-of-type {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default requireAuth(Notes);
