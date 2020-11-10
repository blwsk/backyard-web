import React from "react";
import { stripParams, getHostname } from "../lib/urls";
import Link from "next/link";
import { isTwitter } from "../lib/contentTypes";
import { TweetPreview } from "./tweetEmbed";

export interface ListItemProps {
  _id: string;
  _ts: number;
  url: string;
  content?: {
    title?: string;
    json?: string;
  };
}

const getTweetJson = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    void error;
    return null;
  }
};

const ListItemPreview = ({
  id,
  url,
  content,
}: {
  id: string;
  url: string;
  content?: {
    title?: string;
    json?: string;
  };
}) => {
  const tweetJson = content && getTweetJson(content.json);

  const withParamsStripped = stripParams(url);

  const title = content && content.title ? content.title : withParamsStripped;

  return (
    <>
      <Link href={{ pathname: "/viewer", query: { id } }}>
        {isTwitter(url) && tweetJson ? (
          <a>
            <div className="bg-ghost p-4 -ml-4 md:ml-0 rounded-r-md md:rounded-l-md">
              <TweetPreview tweetJson={tweetJson} />
            </div>
          </a>
        ) : (
          <a className="break-all">{title}</a>
        )}
      </Link>
      <style jsx>{`
        .bg-ghost {
          background-color: var(--ghost);
        }
      `}</style>
    </>
  );
};

const ListItem = ({
  item,
  light = false,
}: {
  item: ListItemProps;
  light?: boolean;
}) => {
  const { _id, _ts, url, content } = item;

  const date = new Date(_ts / 1000);
  const dateString = date.toDateString();
  const timeString = date.toLocaleTimeString();
  const hostname = url && getHostname(url).hostname.replace("www.", "");

  return (
    <div className={`list-item ${light ? "light" : ""} py-3`}>
      <div>
        <b>
          <ListItemPreview id={_id} url={url} content={content} />
        </b>
        <div className="mt-3">
          <small className="flex flex-col md:flex-row">
            <span>
              <span>{dateString}</span>
              <span>・</span>
              <span>{timeString}</span>
            </span>
            {hostname && (
              <>
                <span className="hidden md:block">・</span>
                <Link
                  href={{
                    href: "/my-content",
                    query: {
                      search: encodeURIComponent(hostname),
                    },
                  }}
                >
                  <a className="font-semibold">{hostname}</a>
                </Link>
              </>
            )}
          </small>
        </div>
      </div>
    </div>
  );
};

export default ListItem;
