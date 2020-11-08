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

const getTweetData = ({ data, tweetJson }): TweetData => {
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

  return joinedWithMedia.join("");
};

interface Props {
  data: {
    tweets: TweetData;
  };
  tweetJson: TweetData;
}

const Tweet = ({ data, tweetJson }: Props) => {
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
          <div key={t.id} className="tweet well-trim p-0">
            {author && (
              <>
                <div className="p-4 flex justify-between">
                  <span>
                    <span className="font-semibold mr-2">{author.name}</span>
                    <a href={`https://twitter.com/${author.username}`}>
                      {`@${author.username}`}
                    </a>
                  </span>
                  <a
                    href={`https://twitter.com/${author.username}/status/${t.id}`}
                  >
                    {capitalize(
                      formatRelative(new Date(t.created_at), new Date())
                    )}
                  </a>
                </div>
                <hr />
              </>
            )}
            <pre
              className="tweet-text p-4"
              dangerouslySetInnerHTML={{
                __html: sanitize(getTweetTextWithMedia({ tweet: t, media })),
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
            text-decoration: underline;
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

const TweetEmbed = ({ url, content: persistedTweetData }) => {
  const id = getTweetIdFromUrl(url);

  let tweetJson;

  try {
    tweetJson = JSON.parse(persistedTweetData.json);
  } catch (error) {
    void error;
  }

  const { data } = useAuthedSWR(() => {
    if (tweetJson || !id) {
      throw new Error("purposefully throw to skip fetch");
    }
    return `/api/tweet?ids=${id.id}`;
  }, jsonFetcherFactory);

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
