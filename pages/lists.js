import Header from "../components/header";
import Wrapper from "../components/wrapper";
import { withRouter } from "next/router";
import useSWR from "swr";
import gql from "gql-tag";
import { gqlFetcher } from "../lib/fetcher";
import { useState } from "react";
import ListItem from "../components/listItem";

const ListDrawerContent = ({ list }) => {
  const { _id } = list;

  const { data, error } = useSWR(
    gql`
      query {
        findListItemsByList(id: "${_id}") {
          data {
            _id
            item {
              url
              _id
              _ts
            }
          }
        }
      }
    `,
    gqlFetcher
  );

  if (!data) {
    return <div>Loading...</div>;
  }

  const listItems = data.data.findListItemsByList.data;

  if (listItems.length === 0) {
    return (
      <div>
        <p>
          No list members found. Add things to this list so they appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {listItems.map(({ item, _id: listItemId }) => {
        return <ListItem key={listItemId} item={item} />;
      })}
    </div>
  );
};

const ListDrawer = ({ list, startOpen }) => {
  const { name } = list;
  const [open, updateOpen] = useState(startOpen);

  return (
    <div style={{ marginBottom: 24 }}>
      <h3
        style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        onClick={() => updateOpen(!open)}
      >
        {name}
        <span style={{ fontSize: 16, marginLeft: 12 }}>
          {open ? "🔽" : "🔼"}
        </span>
      </h3>
      {open && <ListDrawerContent list={list} />}
    </div>
  );
};

const ListList = ({ openListId }) => {
  const { data, error, isValidating } = useSWR(
    gql`
      query {
        allLists {
          data {
            name
            _id
            _ts
          }
        }
      }
    `,
    gqlFetcher
  );

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {data.data.allLists.data.map((list) => {
        return (
          <ListDrawer
            key={list._id}
            list={list}
            startOpen={
              typeof openListId === "string" && openListId === list._id
            }
          />
        );
      })}
    </div>
  );
};

const Lists = ({ router }) => {
  const { id } = router.query;

  return (
    <div>
      <Header />
      <Wrapper>
        <h1>Lists</h1>
        <ListList openListId={id} />
      </Wrapper>
    </div>
  );
};

export default withRouter(Lists);
