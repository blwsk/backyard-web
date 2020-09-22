import { useState, useCallback } from "react";

function FileUpload(file) {
  const reader = new FileReader();
  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener(
    "progress",
    function (e) {
      if (e.lengthComputable) {
        const percentage = Math.round((e.loaded * 100) / e.total);
      }
    },
    false
  );

  xhr.upload.addEventListener(
    "load",
    function (e) {
      // on load
    },
    false
  );
  xhr.open("POST", "/api/file-upload");
  xhr.overrideMimeType("text/plain; charset=x-user-defined-binary");
  reader.onload = function (evt) {
    xhr.send(evt.target.result);
  };
  reader.readAsBinaryString(file);
}

const DragAndDrop = ({ style = {}, children }) => {
  const [isHovering, updateIsHovering] = useState(false);

  const onDragStart = useCallback((e) => {
    e.preventDefault();
  });
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    updateIsHovering(true);
  });
  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    updateIsHovering(false);
  });
  const onDrop = useCallback((e) => {
    e.preventDefault();
    updateIsHovering(false);
    const dt = e.dataTransfer;
    const files = dt.files;
    new FileUpload(files[0]);
  });

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
            <div
              className="drop"
              onDragStart={onDragStart}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <h1>Drop to upload</h1>
            </div>
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
