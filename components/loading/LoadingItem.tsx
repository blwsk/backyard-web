import ContentPageItem from "../contentPageItem";
import { ListItemProps } from "../listItem";

const LoadingItem = () => {
  const item: ListItemProps = {
    legacyId: "0",
    createdAt: Date.now(),
    url: "https://loading.com",
    content: {
      title: "Loading...",
    },
  };
  return (
    <ContentPageItem item={item} className="bg-gray-200 dark:bg-gray-900" />
  );
};

export default LoadingItem;
