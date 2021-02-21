import React, { useState } from "react";
import { getParsedOriginEmail } from "../lib/getParsedOriginEmail";
import OriginalEmail from "./originEmailBody";
import RenderedContent from "./renderedContent";
import Selection from "./selection";
import Button from "./ui/Button";

const EmailSandbox = ({
  originEmailBody,
  itemId,
  modernItemId,
  invalidateQuery,
}) => {
  const html = getParsedOriginEmail(originEmailBody);

  const [showParsed, updateShowParsed] = useState(!!html);

  return (
    <div>
      {!!html && (
        <div className="flex mb-4">
          <Button
            current={showParsed}
            onClick={() => updateShowParsed(true)}
            variant="selectable"
            size="small"
            grouped
            first
          >
            Parsed
          </Button>
          <Button
            current={!showParsed}
            onClick={() => updateShowParsed(false)}
            variant="selectable"
            size="small"
            grouped
            last
          >
            Original
          </Button>
        </div>
      )}
      {showParsed ? (
        <>
          <RenderedContent body={html} />
          <Selection
            itemId={itemId}
            modernItemId={modernItemId}
            invalidateQuery={invalidateQuery}
          />
        </>
      ) : (
        <OriginalEmail originEmailBody={originEmailBody} />
      )}
    </div>
  );
};

export default EmailSandbox;
