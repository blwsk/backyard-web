import formatRelative from "date-fns/formatRelative";
import { capitalize } from "../lib/capitalize";
import { useAuthedSWR } from "../lib/requestHooks";
import { jsonFetcherFactory } from "../lib/fetcherFactories";
import { getTweetIdFromUrl } from "../lib/tweetIdFromUrl";

const TCO_PATTERN = /https:\/\/t.co\/[0-9a-zA-Z]\w+/g;

const getTweetData = ({ data, tweetJson }) => {
  if (tweetJson) {
    return tweetJson;
  }

  return data.tweets;
};

const TweetTextWithMedia = ({ tweet, media }) => {
  const splitOnTco = tweet.text.split(TCO_PATTERN);
  const joinedWithMedia = splitOnTco.reduce((acc, part, i) => {
    if (i === splitOnTco.length - 1) {
      return [...acc, <span key={i}>{part}</span>];
    }
    const mediaContent = "😀";
    return [
      ...acc,
      <span key={i}>{part}</span>,
      <span key={`${i}.media`}>{mediaContent}</span>,
    ];
  }, []);

  return <pre className="tweet-text">{joinedWithMedia}</pre>;
};

const Tweet = ({ data, tweetJson }) => {
  const {
    data: tweets,
    includes: { media, users },
  } = getTweetData({ data, tweetJson });

  return (
    <div>
      {tweets.map((t) => {
        const author = users.reduce((acc, u) => u.id === t.author_id);

        return (
          <div key={t.id} className="tweet">
            <TweetTextWithMedia tweet={t} media={media} />
            {author && (
              <div className="tweet-footer">
                {author.name}{" "}
                <a href={`https://twitter.com/${author.username}`}>
                  {`@${author.username}`}
                </a>
                {" ・ "}
                <a
                  href={`https://twitter.com/${author.username}/status/${t.id}`}
                >
                  {capitalize(
                    formatRelative(new Date(t.created_at), new Date())
                  )}
                </a>
              </div>
            )}
          </div>
        );
      })}
      <style jsx global>
        {`
          pre.tweet-text {
            font: var(--sans);
            white-space: pre-line;
            background-color: var(--ghost);
            padding: 16px;
          }
          .tweet-footer {
            padding: 0 16px;
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

  const { data, error, isValidating } = useAuthedSWR(() => {
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
