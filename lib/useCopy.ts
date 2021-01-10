import { useEffect, useState } from "react";

export const useCopy = () => {
  const [copied, updateCopied] = useState(false);
  const [showCopied, updateShow] = useState(false);

  useEffect(() => {
    let timeout;

    if (copied) {
      updateShow(true);

      timeout = setTimeout(() => {
        updateShow(false);
        updateCopied(false);
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [copied]);

  const copy = (item) => {
    navigator.clipboard.writeText(item).then(() => {
      updateCopied(true);
    });
  };

  return { copy, showCopied };
};
