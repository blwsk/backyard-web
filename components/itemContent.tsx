import { isTwitter, isYouTube } from "../lib/contentTypes";
import TweetEmbed from "./tweetEmbed";
import YouTubeEmbed from "./youTubeEmbed";

const ItemContent = ({ data, url, content }) => {
  if (isTwitter(url)) {
    return <TweetEmbed url={url} content={content} />;
  }

  if (isYouTube(url)) {
    return <YouTubeEmbed url={url} />;
  }

  const body =
    (data && data.content && data.content.body) || (content && content.body);

  if (!body) {
    return <p>Loading...</p>;
  }

  return (
    <div
      className="rendered-html-body"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
};

export default ItemContent;
