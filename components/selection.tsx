import { useEffect, useCallback, useState } from "react";
import { debounce } from "../lib/debounce";
import { useAuthedCallback } from "../lib/requestHooks";
import { jsonFetcherFactory } from "../lib/fetcherFactories";
import { isiOs } from "../lib/isiOs";
import Button from "./ui/Button";

const Selection = ({
  itemId,
  modernItemId,
  invalidateQuery,
}: {
  itemId: string;
  modernItemId: string;
  invalidateQuery: () => void;
}) => {
  const [viewportSizeKey, updateViewportSizeKey] = useState(
    `${window.innerHeight}.${window.innerWidth}`
  );

  const [selection, updateSelection] = useState({
    text: null,
    htmlChunk: null,
    anchorNode: null,
    focusNode: null,
  });

  const [textSelectionSaveState, updateTextSelectionSaveState] = useState({
    started: false,
    success: false,
    error: null,
    data: null,
  });

  const onSelectionChange = useCallback(
    debounce(() => {
      const currentSelection = document.getSelection();

      if (currentSelection && !currentSelection.isCollapsed) {
        const text = currentSelection.toString();
        let htmlChunk;

        if (
          currentSelection.focusNode &&
          currentSelection.focusNode.parentElement
        ) {
          htmlChunk = currentSelection.focusNode.parentElement.innerHTML;
        }

        updateSelection({
          text,
          htmlChunk,
          anchorNode: currentSelection.anchorNode,
          focusNode: currentSelection.focusNode,
        });
      } else {
        updateSelection({
          text: null,
          htmlChunk: null,
          anchorNode: null,
          focusNode: null,
        });
        updateTextSelectionSaveState({
          started: false,
          success: false,
          error: null,
          data: null,
        });
      }
    }, 250),
    []
  );

  const onResize = debounce(() => {
    updateViewportSizeKey(`${window.innerHeight}.${window.innerWidth}`);
  }, 100);

  useEffect(() => {
    document.onselectionchange = onSelectionChange;
    window.onresize = onResize;

    return () => {
      document.onselectionchange = () => {};
      window.onresize = () => {};
    };
  }, []);

  /**
           * If the selection is from bottom to top, the following is preferable, but does not support click to highlight very well:
           * 
           selection.anchorNode &&
            selection.focusNode &&
            (selection.anchorNode.parentElement.offsetTop <
            selection.focusNode.parentElement.offsetTop
              ? selection.anchorNode
              : selection.focusNode)
           */
  const upperSelectionNode = selection.anchorNode;

  const doTextSelection = useAuthedCallback(
    "/api/create-text-selection",
    {
      method: "POST",
      body: JSON.stringify({
        itemId,
        text: selection.text,
        modernItemId,
      }),
    },
    jsonFetcherFactory
  );

  const onSave = useCallback(() => {
    updateTextSelectionSaveState({
      started: true,
      success: false,
      error: null,
      data: null,
    });

    doTextSelection()
      .then((res) => {
        updateTextSelectionSaveState({
          started: false,
          success: true,
          data: res,
          error: null,
        });

        invalidateQuery();
      })
      .catch((error) => {
        updateTextSelectionSaveState({
          started: false,
          success: false,
          error,
          data: null,
        });
      });
  }, [selection, itemId]);
  return (
    <>
      {upperSelectionNode && (
        <div
          key={viewportSizeKey}
          className="bg-gray-300 text-black dark:bg-black dark:text-white"
          style={{
            borderRadius: 8,

            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 8,
            flexDirection: "column",
            ...(isiOs()
              ? {
                  position: "sticky",
                  bottom: 16,
                  width: "100%",
                  borderRadius: 8,
                  height: 100,
                }
              : {
                  position: "absolute",
                  height: 100,
                  width: 200,
                  top: upperSelectionNode.parentElement.offsetTop - (100 + 8),
                  left: Math.round(0.5 * window.innerWidth) - 100,
                }),
          }}
        >
          <div className="p-1">
            <small>
              <b>{selection.text.length}</b> characters
            </small>
          </div>
          <div>
            {selection.text && selection.text.length > 0 && (
              <>
                {!textSelectionSaveState.started &&
                  !textSelectionSaveState.success && (
                    <Button variant="secondary" onClick={onSave}>
                      Save 🗄
                    </Button>
                  )}
                {textSelectionSaveState.success && <div>Success ✅</div>}
                {textSelectionSaveState.error && <span>Error ❌</span>}
              </>
            )}
          </div>
          <style jsx>{`
            button {
              background: var(--c3);
              color: var(--c1);
              padding: 0.4em 0.6em;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default Selection;
