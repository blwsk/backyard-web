import React, { useState, useEffect } from "react";

const OriginalEmail = ({ originEmailBody }) => {
  const [mounted, updateMounted] = useState(true);
  const [iframe, updateIframe] = useState<HTMLIFrameElement>();

  useEffect(() => {
    if (iframe) {
      iframe.contentDocument.querySelectorAll("a").forEach((a) => {
        a.target = "_blank";
      });
    }
    return () => updateMounted(false);
  }, [iframe]);

  return (
    <>
      <div className="iframe-wrapper w-full rounded border border-solid border-black">
        <iframe
          ref={(el) => {
            setTimeout(() => mounted && updateIframe(el));
          }}
          srcDoc={originEmailBody}
          width="100%"
          height="100%"
        />
      </div>
      <style jsx>{`
        .iframe-wrapper {
          background: white;
          height: 50vh;
        }
      `}</style>
    </>
  );
};

export default OriginalEmail;
