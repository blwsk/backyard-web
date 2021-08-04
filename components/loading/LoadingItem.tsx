import { ItemPreview } from "../../types/ItemTypes";
import ContentPageItem from "../contentPageItem";

const LoadingItem = () => {
  const itemPreview: ItemPreview = {
    id: -1,
    legacyId: BigInt(0),
    createdAt: Date.now(),
    createdBy: "",
    domain: "loading.com",
    title: "Loading...",
    source: "manual",
  };

  return (
    <ContentPageItem
      itemPreview={itemPreview}
      className="bg-gray-200 dark:bg-gray-900"
    />
  );
};

export default LoadingItem;
