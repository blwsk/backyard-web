import sanitize from "sanitize-html";

import { isTwitter, isYouTube } from "../lib/contentTypes";
import TweetEmbed from "./tweetEmbed";
import YouTubeEmbed from "./youTubeEmbed";
import { ItemContent as ItemContentType } from "../types/ItemTypes";

const ItemContent = ({
  data,
  url,
  content,
}: {
  data?: {
    content?: ItemContentType;
  };
  url: string;
  content?: ItemContentType;
  originEmailBody?: string;
}) => {
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
      dangerouslySetInnerHTML={{ __html: sanitize(body) }}
    />
  );
};

export default ItemContent;
