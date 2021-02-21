import { isTwitter, isYouTube } from "../lib/contentTypes";
import TweetEmbed from "./tweetEmbed";
import YouTubeEmbed from "./youTubeEmbed";
import {
  EmailJson,
  isEmailJson,
  ItemContent as ItemContentType,
} from "../types/ItemTypes";
import RenderedContent from "./renderedContent";
import EmailSandbox from "./emailSandbox";

const ItemContent = ({
  data,
  url,
  content,
  itemId,
  modernItemId,
  invalidateQuery,
}: {
  data?: {
    content?: ItemContentType;
  };
  url?: unknown;
  content?: ItemContentType;
  originEmailBody?: string;
  itemId: any;
  modernItemId: any;
  invalidateQuery: () => void;
}) => {
  if (url) {
    if (isTwitter(url)) {
      return <TweetEmbed url={url} content={content} />;
    }

    if (isYouTube(url)) {
      return <YouTubeEmbed url={url as string} />;
    }
  }

  if (content && content.json && isEmailJson(content.json)) {
    const originEmailBody: string = (content.json as EmailJson).html;

    return (
      <EmailSandbox
        originEmailBody={originEmailBody}
        itemId={itemId}
        modernItemId={modernItemId}
        invalidateQuery={invalidateQuery}
      />
    );
  }

  const body =
    (data && data.content && data.content.body) || (content && content.body);

  if (!body) {
    return <p>Loading...</p>;
  }

  return <RenderedContent body={body} />;
};

export default ItemContent;
