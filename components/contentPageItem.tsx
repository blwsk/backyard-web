import { ReactNode, useMemo } from "react";
import ListItem from "./listItem";
import { classNames } from "../lib/classNames";
import { ItemPreview } from "../types/ItemTypes";

const colors = [
  "c62828",
  "AD1457",
  "6A1B9A",
  "4527A0",
  "283593",
  "1565C0",
  "0277BD",
  "00838F",
  "00695C",
  "2E7D32",
  "558B2F",
  "9E9D24",
  "F9A825",
  "FF8F00",
  "EF6C00",
  "D84315",
  "4E342E",
  "424242",
  "37474F",
];

const getColorFromString = (str) => {
  if (!str) return null;

  const numLetters = 26;
  const charCode = str.charCodeAt(0);
  const relative = 122 - charCode; // 122 is the char code for `z`
  const numColors = colors.length;
  const selectedColor = colors[Math.floor(relative / (numLetters / numColors))];

  return `#${selectedColor}`;
};

const getBackgroundColor = (domain?: string) => {
  if (domain) {
    return getColorFromString(domain.replace("www.", ""));
  }

  return `#626262`;
};

const ContentPageItem = ({
  itemPreview,
  renderCheckbox = () => null,
  className,
}: {
  itemPreview: ItemPreview;
  renderCheckbox?: () => ReactNode;
  className?: string;
}) => {
  const { legacyId, domain } = itemPreview;

  const checkboxNode = useMemo(() => renderCheckbox(), [renderCheckbox]);

  const backgroundColor = getBackgroundColor(domain);

  return (
    <div
      className={classNames(
        "flex justify-between items-center p-4 mb-2 md:rounded-md text-white",
        className
      )}
      key={`${legacyId}`}
      style={
        !className
          ? {
              backgroundColor,
            }
          : undefined
      }
    >
      <ListItem itemPreview={itemPreview} light />
      {checkboxNode && <div className="ml-4">{checkboxNode}</div>}
    </div>
  );
};

export default ContentPageItem;
