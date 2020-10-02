import React from "react";

const Wrapper = ({ children, align }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
        wordBreak: "break-word",
        width: "100%",
        maxWidth: "760px",
        margin: "0 auto",
        alignItems: align ? align : "inherit",
      }}
    >
      {children}
    </div>
  );
};

export default Wrapper;
