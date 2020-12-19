import { ReactElement, MouseEventHandler } from "react";
import { classNames } from "../lib/classNames";

export const Button = ({
  current,
  onClick,
  children,
  first,
  last,
}: {
  current: boolean;
  loaded?: boolean;
  onClick: MouseEventHandler;
  children: ChildNode | string;
  first?: boolean;
  last?: boolean;
}): ReactElement => (
  <button
    className={classNames(`text-black bg-gray-300 py-2 px-3 m-0 rounded-none`, {
      "bg-gray-400": current,
      "rounded-l-md": first,
      "rounded-r-md": last,
    })}
    onClick={onClick}
  >
    {children}
  </button>
);

const ItemControls = ({ current, updateCurrent, originEmailBody }) => {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <Button
          current={current === "content"}
          onClick={() => updateCurrent("content")}
          first
        >
          Content
        </Button>
        {originEmailBody && (
          <Button
            current={current === "email"}
            onClick={() => updateCurrent("email")}
          >
            Email
          </Button>
        )}
        <Button
          current={current === "clips"}
          onClick={() => updateCurrent("clips")}
          last
        >
          Clips
        </Button>
      </div>
    </div>
  );
};

export default ItemControls;
