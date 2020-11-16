import { useState, ReactElement, MouseEventHandler } from "react";
import SelectList from "./selectList";
import { classNames } from "../lib/classNames";

const Button = ({
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
    className={classNames(`small secondary m-0 rounded-none`, {
      current,
      "rounded-l-md": first,
      "rounded-r-md": last,
    })}
    onClick={onClick}
  >
    {children}
  </button>
);

const ItemControls = ({ current, updateCurrent, itemId, originEmailBody }) => {
  const [showSelectList, updateShowSelectList] = useState(false);

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
        <Button
          current={current === "clips"}
          onClick={() => updateCurrent("clips")}
        >
          Clips
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
          current={showSelectList}
          onClick={() => {
            updateShowSelectList(!showSelectList);
          }}
          last
        >
          More
        </Button>
      </div>
      {showSelectList && (
        <div className="py-2">
          <SelectList inline ids={[itemId]} />
        </div>
      )}
    </div>
  );
};

export default ItemControls;
