import { useState, useCallback, ReactNode, CSSProperties } from "react";
import { useAuthedCallback } from "../lib/requestHooks";

const uploadFile = (file: any) => {
  return new Promise((resolve) => setTimeout(() => resolve(), 1000));
};

type Props = {
  style: CSSProperties;
  children: ReactNode;
};

const DragAndDrop = ({ style = {}, children }: Props) => {
  const [isHovering, updateIsHovering] = useState(false);
  const [file, updateFile] = useState(null);
  const [uploading, updateIsUploading] = useState(false);
  const [completedUpload, updateUploadComplete] = useState(false);

  const doFileUpload = useAuthedCallback("/api/file-upload", {}, () => () =>
    uploadFile(file)
  );

  const onDragStart = useCallback((e) => {
    e.preventDefault();
  }, []);
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    updateIsHovering(true);
  }, []);
  const onDragLeave = useCallback(
    (e) => {
      e.preventDefault();
      if (!uploading) {
        updateIsHovering(false);
      }
    },
    [file, uploading]
  );
  const onDrop = useCallback(
    (e) => {
      e.preventDefault();

      const dt = e.dataTransfer;
      const files = dt.files;
      const firstFile = files[0];

      updateIsUploading(true);
      updateFile(firstFile);

      doFileUpload().then(() => {
        updateIsUploading(false);
        updateUploadComplete(true);

        setTimeout(() => {
          updateIsHovering(false);
          updateUploadComplete(false);
          updateFile(null);
        }, 1000);
      });
    },
    [file, uploading]
  );

  return (
    <>
      <div
        style={{ ...style }}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
      >
        <div className={isHovering ? "droppable" : undefined}>{children}</div>
        {isHovering && (
          <>
            <div className="bg drop"></div>
            <div className="drop">
              <h1>
                {uploading
                  ? "Uploading..."
                  : completedUpload
                  ? "Successfully uploaded ✅"
                  : "Drop to upload"}
              </h1>
            </div>
            <div
              className="drop"
              onDragStart={onDragStart}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            />
          </>
        )}
      </div>
      <style jsx>{`
        .droppable {
          height: 100%;
          filter: blur(4px);
          position: relative;
        }
        .drop {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .bg {
          background: var(--c3);
          opacity: 0.7;
        }
      `}</style>
    </>
  );
};

export default DragAndDrop;
