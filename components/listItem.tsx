import React, { forwardRef } from "react";
import { stripParams, getHostname } from "../lib/urls";
import Link from "next/link";
import { isTwitter } from "../lib/contentTypes";
import { TweetPreview } from "./tweetEmbed";
import { ItemSource, MANUAL } from "../types/ItemTypes";

export interface ListItemProps {
  _id: string;
  _ts: number;
  url: string;
  content?: {
    title?: string;
    json?: string;
  };
  source?: ItemSource;
}

const getTweetJson = ({ json }: { json?: string }) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    void error;
    return null;
  }
};

const PreviewLink = ({
  id,
  content,
  url,
}: {
  id: string;
  url: string;
  content?: {
    title?: string;
    json?: string;
  };
}) => {
  const tweetJson = content && getTweetJson(content);

  const withParamsStripped = stripParams(url);

  const tester = isTwitter;
  debugger;
  if (tester(url) && tweetJson) {
    debugger;
    return (
      <Link href={{ pathname: "/viewer", query: { id } }}>
        <a>
          <div className="p-4 -ml-4 rounded-r-md md:rounded-l-md">
            <TweetPreview tweetJson={tweetJson} />
          </div>
        </a>
      </Link>
    );
  }

  if (content && content.title) {
    debugger;
    return (
      <Link href={{ pathname: "/viewer", query: { id } }}>
        <a className="break-words">{content.title}</a>
      </Link>
    );
  }
  debugger;
  return (
    <Link href={{ pathname: "/viewer", query: { id } }}>
      <a className="break-all">{withParamsStripped}</a>
    </Link>
  );
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
  return (
    <>
      <PreviewLink id={id} url={url} content={content} />
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
  const { _id, _ts, url, content, source } = item;

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
              {source && source !== MANUAL && (
                <>
                  <span>・</span>
                  <span className="uppercase">{source}</span>
                </>
              )}
            </span>
            {hostname && (
              <>
                <span className="hidden md:block">・</span>
                <Link
                  href={{
                    pathname: "/my-content",
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
