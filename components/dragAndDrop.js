import { useState } from "react";

const DragAndDrop = ({ style = {}, children }) => {
  const [isHovering, updateIsHovering] = useState(false);

  /**
   * debounce this shit
   */

  return (
    <div
      style={{ ...style, background: isHovering ? "yellow" : "inherit" }}
      onDragStart={(e) => {
        e.preventDefault();
        // updateIsHovering(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        updateIsHovering(true);
      }}
      onDrop={(e) => {
        e.preventDefault();
        updateIsHovering(false);
        console.log(e);
      }}
      onDragEnd={(e) => {
        e.preventDefault();
        updateIsHovering(false);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        updateIsHovering(false);
      }}
    >
      {children}
    </div>
  );
};

export default DragAndDrop;
