import React from "react";
import { stripParams } from "../lib/urls";
import Link from "next/link";

/**
 *
 * Note: this is very similar to MyContent's ContentPage component
 *
 */

const ListItem = ({ item }) => {
  const { _id, _ts, url } = item;

  const encodedUrl = encodeURI(url);
  const withParamsStripped = stripParams(url);

  const date = new Date(_ts / 1000);
  const dateString = date.toDateString();
  const timeString = date.toLocaleTimeString();

  return (
    <div
      key={_id}
      className="p-y-3"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <Link
          href={{ pathname: "/viewer", query: { url: encodedUrl, id: _id } }}
        >
          <a>{withParamsStripped}</a>
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
