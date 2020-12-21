import sanitizeHtml from "sanitize-html";

const sanitize = (body) => {
  return sanitizeHtml(body, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      a: ["href", "target"],
      img: ["src"],
    },
  });
};

const RenderedContent = ({ body }: { body: string }) => {
  return (
    <div
      className="rendered-html-content"
      dangerouslySetInnerHTML={{
        __html: sanitize(body),
      }}
    />
  );
};

export default RenderedContent;
