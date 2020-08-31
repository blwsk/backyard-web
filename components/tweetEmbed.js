import useSWR from "swr";
import { jsonFetcher } from "../lib/fetcher";
import formatRelative from "date-fns/formatRelative";
import { capitalize } from "../lib/capitalize";

const TCO_PATTERN = /https:\/\/t.co\/[0-9a-zA-Z]\w+/g;

const getIdFromUrl = (url) => {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const pathnameParts = pathname.split("/");
  const statusIndex = pathnameParts.indexOf("status");

  if (statusIndex > -1) {
    return { id: pathnameParts[statusIndex + 1] };
  }

  return null;
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

const Tweet = ({ data }) => {
  const {
    tweets: {
      data: tweets,
      includes: { media, users },
    },
  } = data;

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

const TweetEmbed = ({ url }) => {
  const id = getIdFromUrl(url);

  const { data, error, isValidating } = useSWR(
    /**
     * purposefully throw if no id
     */
    () => `/api/tweet?ids=${id.id}`,
    jsonFetcher
  );

  return (
    <div>
      {id && id.id ? (
        data ? (
          <Tweet data={data} />
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
