import formatRelative from "date-fns/formatRelative";
import sanitize from "sanitize-html";
import { capitalize } from "../lib/capitalize";
import { useAuthedSWR } from "../lib/requestHooks";
import { jsonFetcherFactory } from "../lib/fetcherFactories";
import { getTweetIdFromUrl } from "../lib/tweetIdFromUrl";

const TCO_PATTERN = /https:\/\/t.co\/[0-9a-zA-Z]\w+/g;

interface TwitterUser {
  id: string;
  name: string;
  username: string;
}

interface Tweet {
  author_id: string;
  id: string;
  created_at: string;
}

interface TweetData {
  data: Tweet[];
  includes: {
    media: any[];
    users: TwitterUser[];
  };
}

const getTweetData = ({
  data,
  tweetJson,
}: {
  data?: {
    tweets: TweetData;
  };
  tweetJson?: TweetData;
}): TweetData => {
  if (tweetJson) {
    return tweetJson;
  }

  return data.tweets;
};

const getTweetTextWithMedia = ({ tweet, media }) => {
  const splitOnTco = tweet.text.split(TCO_PATTERN);
  const joinedWithMedia = splitOnTco.reduce((acc, part, i) => {
    if (i === splitOnTco.length - 1) {
      return [...acc, part];
    }
    const mediaContent = "😀";
    return [...acc, part, mediaContent];
  }, []);

  return sanitize(joinedWithMedia.join(""));
};

export const TweetPreview = ({
  data,
  tweetJson,
}: {
  data?: {
    tweets: TweetData;
  };
  tweetJson?: TweetData;
}) => {
  const {
    data: tweets,
    includes: { media, users },
  } = getTweetData({ data, tweetJson });

  return (
    <div>
      {tweets.map((t) => {
        const author: TwitterUser = users.reduce((acc, u: TwitterUser) =>
          u.id === t.author_id ? u : acc
        );

        return (
          <div key={t.id} className="p-0">
            {author && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="flex">
                  <span className="font-semibold mr-2">{author.name}</span>
                  <span className="font-normal">{`@${author.username}`}</span>
                </span>
                <small className="font-normal">
                  {capitalize(
                    formatRelative(new Date(t.created_at), new Date())
                  )}
                </small>
              </div>
            )}
            <pre
              className="tweet-text line-clamp-2"
              dangerouslySetInnerHTML={{
                __html: getTweetTextWithMedia({ tweet: t, media }),
              }}
            />
          </div>
        );
      })}
      <style jsx>
        {`
          .tweet hr {
            border-color: var(--c9);
          }
          pre.tweet-text {
            font: var(--sans);
            white-space: pre-line;
          }
        `}
      </style>
    </div>
  );
};

export const Tweet = ({
  data,
  tweetJson,
}: {
  data?: {
    tweets: TweetData;
  };
  tweetJson?: TweetData;
}) => {
  const tweetData = getTweetData({ data, tweetJson });
  const {
    data: tweets,
    includes: { media, users },
  } = tweetData;

  return (
    <div>
      {tweets.map((t) => {
        const author: TwitterUser = users.reduce((acc, u: TwitterUser) =>
          u.id === t.author_id ? u : acc
        );

        return (
          <div key={t.id} className="tweet p-0">
            {author && (
              <>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3">
                  <span className="flex">
                    <span className="font-semibold mr-2">{author.name}</span>
                    <span className="font-normal">{`@${author.username}`}</span>
                  </span>
                  <small className="font-normal">
                    {capitalize(
                      formatRelative(new Date(t.created_at), new Date())
                    )}
                  </small>
                </div>
                <hr />
              </>
            )}
            <pre
              className="tweet-text p-4"
              dangerouslySetInnerHTML={{
                __html: getTweetTextWithMedia({ tweet: t, media }),
              }}
            />
          </div>
        );
      })}
      <style jsx>
        {`
          .tweet hr {
            border-color: var(--c9);
          }
          .tweet a {
            color: var(--c1);
          }
          pre.tweet-text {
            font: var(--sans);
            white-space: pre-line;
          }
        `}
      </style>
    </div>
  );
};

const getJson = ({ json }: { json?: unknown }) => {
  if (typeof json === "object") {
    return json;
  }
  if (typeof json === "string") {
    try {
      return JSON.parse(json);
    } catch (error) {
      void error;
      return null;
    }
  }

  return null;
};

const TweetEmbed = ({ url, content: persistedTweetData }) => {
  const id = getTweetIdFromUrl(url);

  let tweetJson = persistedTweetData ? getJson(persistedTweetData) : null;

  const { data } = useAuthedSWR(() => {
    if (tweetJson || !id) {
      throw new Error("purposefully throw to skip fetch");
    }
    return `/api/tweet?ids=${id.id}`;
  }, jsonFetcherFactory);

  tweetJson = tweetJson || (data && data.tweets);

  return (
    <div>
      {id && id.id ? (
        data || tweetJson ? (
          <Tweet data={data} tweetJson={tweetJson} />
        ) : (
          <div>Loading...</div>
        )
      ) : (
        <div>Provided url does not look like a link to a tweet</div>
      )}
    </div>
  );
};

export default TweetEmbed;
