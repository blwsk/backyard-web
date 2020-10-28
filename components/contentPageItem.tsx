import { ReactNode } from "react";
import ListItem, { ListItemProps } from "./listItem";
import { getHostname } from "../lib/urls";

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

type ContentPageItemProps = {
  item: ListItemProps;
  backgroundColor?: string;
  renderCheckbox?: () => ReactNode;
};

const ContentPageItem = ({
  item,
  backgroundColor = undefined,
  renderCheckbox = () => null,
}: ContentPageItemProps) => {
  const { _id, url } = item;

  return (
    <>
      <div
        className="content-item"
        key={_id}
        style={{
          backgroundColor:
            backgroundColor ||
            getColorFromString(getHostname(url).hostname.replace("www.", "")),
        }}
      >
        <ListItem item={item} light />
        {renderCheckbox()}
      </div>
      <style jsx>
        {`
          .content-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 4px;
            margin-bottom: 8px;
            padding: 16px;
          }
          .content-item input[type="checkbox"] {
            height: 20px;
            width: 20px;
            cursor: pointer;
            margin-left: 16px;
          }
        `}
      </style>
    </>
  );
};

export default ContentPageItem;
