import React, { FunctionComponent } from "react";
import { stripParams } from "../lib/urls";
import Link from "next/link";

export interface ListItemProps {
  _id: string;
  _ts: number;
  url: string;
  content?: {
    title?: string;
  };
}

interface Props {
  item: ListItemProps;
  light?: boolean;
}

const ListItem: FunctionComponent<Props> = ({ item, light = false }) => {
  const { _id, _ts, url, content } = item;

  const withParamsStripped = stripParams(url);

  const title = content && content.title ? content.title : withParamsStripped;

  const date = new Date(_ts / 1000);
  const dateString = date.toDateString();
  const timeString = date.toLocaleTimeString();

  return (
    <div className={`list-item ${light ? "light" : ""} p-y-3`}>
      <div>
        <b>
          <Link href={{ pathname: "/viewer", query: { id: _id } }}>
            <a>{title}</a>
          </Link>
        </b>
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
