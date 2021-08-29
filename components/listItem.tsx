import React from "react";
import Link from "next/link";
import { TweetPreview } from "./tweetEmbed";
import { ItemPreview, ItemSource, MANUAL, TweetJson } from "../types/ItemTypes";
import Icon from "./ui/Icon";
import Timestamp from "./ui/Timestamp";

const EmailJsonPreview = ({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) => {
  return (
    <div>
      <div>
        <b>{title || <i className="font-light">No subject</i>}</b>
      </div>
      <div className="flex items-center">
        <span className="mr-2 opacity-50">
          <Icon name="mail" size="md" />
        </span>
        <span className="">{subtitle}</span>
      </div>
    </div>
  );
};

const PreviewLink = ({
  id,
  hostname,
  title,
  subtitle,
  json,
  source,
}: {
  id: string;
  hostname?: string;
  title?: string;
  subtitle?: string;
  json?: object;
  source: ItemSource;
}) => {
  const tweetJson = json as TweetJson;

  if (hostname && hostname.indexOf("twitter.com") && tweetJson) {
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

  if (source === "email") {
    return (
      <Link href={{ pathname: "/viewer", query: { id } }}>
        <a>
          <div className="p-4 -ml-4 rounded-r-md md:rounded-l-md">
            <EmailJsonPreview title={title} subtitle={subtitle} />
          </div>
        </a>
      </Link>
    );
  }

  if (title) {
    return (
      <Link href={{ pathname: "/viewer", query: { id } }}>
        <a className="font-semibold break-words">{title}</a>
      </Link>
    );
  }

  return (
    <Link href={{ pathname: "/viewer", query: { id } }}>
      <a className="font-semibold break-all">Unnamed content</a>
    </Link>
  );
};

const ListItemPreview = ({
  id,
  hostname,
  title,
  subtitle,
  json,
  source,
}: {
  id: string;
  hostname?: string;
  title?: string;
  subtitle?: string;
  json?: object;
  source: ItemSource;
}) => {
  return (
    <>
      <PreviewLink
        id={id}
        hostname={hostname}
        title={title}
        subtitle={subtitle}
        json={json}
        source={source}
      />
      <style jsx>{`
        .bg-ghost {
          background-color: var(--ghost);
        }
      `}</style>
    </>
  );
};

const ListItem = ({
  itemPreview,
  light = false,
}: {
  itemPreview: ItemPreview;
  light?: boolean;
}) => {
  const { legacyId, createdAt, domain, title, subtitle, source, json } =
    itemPreview;

  const hostname = domain && domain.replace("www.", "");

  return (
    <div className={`list-item ${light ? "light" : ""} py-3 w-full`}>
      <div className="w-full">
        <ListItemPreview
          id={`${legacyId}`}
          hostname={hostname}
          title={title}
          subtitle={subtitle}
          json={json}
          source={source}
        />
        <div className="mt-3">
          <small className="flex flex-col md:flex-row">
            <span>
              <Timestamp ts={createdAt} />
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
