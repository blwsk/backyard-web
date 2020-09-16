import React from "react";
import { stripParams } from "../lib/urls";
import Link from "next/link";

const ListItem = ({ item }) => {
  const { _id, _ts, url, content } = item;

  const withParamsStripped = stripParams(url);

  const title = content && content.title ? content.title : withParamsStripped;

  const date = new Date(_ts / 1000);
  const dateString = date.toDateString();
  const timeString = date.toLocaleTimeString();

  return (
    <div
      className="p-y-3"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <Link href={{ pathname: "/viewer", query: { id: _id } }}>
          <a>{title}</a>
        </Link>
        <div>
          <small>
            <span>{dateString}</span>
            <span>・</span>
            <span>{timeString}</span>
          </small>
        </div>
      </div>
    </div>
  );
};

export default ListItem;
