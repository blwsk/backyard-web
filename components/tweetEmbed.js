import useSWR from "swr";
import { jsonFetcher } from "../lib/fetcher";

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
            <pre>{t.text}</pre>
            {author && (
              <div>
                <hr />
                {author.name}{" "}
                <a href={`https://twitter.com/${author.username}`}>
                  {`@${author.username}`}
                </a>
              </div>
            )}
          </div>
        );
      })}
      <style jsx>
        {`
          pre {
            font: var(--sans);
            white-space: pre-line;
          }
          .tweet {
            padding: 16px;
          }
          .tweet hr {
            margin: 16px 0;
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
