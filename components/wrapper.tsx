import React from "react";

const Wrapper = ({ children, className = "" }) => {
  return (
    <div
      className={`flex flex-col mx-auto w-full max-w-3xl break-words p-4 ${className}`}
    >
      {children}
    </div>
  );
};

export default Wrapper;
