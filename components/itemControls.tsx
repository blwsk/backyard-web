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

const ItemControls = ({ onShowContent, onShowClips, showClips, itemId }) => {
  const [showSelectList, updateShowSelectList] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="flex">
        <Button current={!showClips} onClick={onShowContent} first>
          Content
        </Button>
        <Button current={showClips} onClick={onShowClips}>
          Clips
        </Button>
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
