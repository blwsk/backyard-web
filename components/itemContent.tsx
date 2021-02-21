import { isTwitter, isYouTube } from "../lib/contentTypes";
import TweetEmbed from "./tweetEmbed";
import YouTubeEmbed from "./youTubeEmbed";
import { ItemContent as ItemContentType } from "../types/ItemTypes";
import RenderedContent from "./renderedContent";
import OriginalEmail from "./originEmailBody";
import EmailSandbox from "./emailSandbox";

const EmailBody = ({ json }: { json: { html: string } }) => {
  const html = json.html;

  return <OriginalEmail originEmailBody={html} />;
};

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

  if (content.json && typeof content.json === "object") {
    const originEmailBody: string = (content.json as { html: string }).html;

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
