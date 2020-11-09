import React from "react";
import { classNames } from "../lib/classNames";

const Wrapper = ({
  children,
  className,
  flush,
}: {
  children: any;
  className?: string;
  flush?: boolean;
}) => {
  return (
    <div
      className={classNames(
        "wrapper flex flex-col mx-auto w-full max-w-3xl break-words",
        {
          [className]: className,
          "px-0 py-4 md:px-4": flush,
          "p-4": !flush,
        }
      )}
    >
      {children}
      <style jsx global>{`
        .wrapper > h1 {
          margin-top: 0em;
        }
      `}</style>
    </div>
  );
};

export default Wrapper;
