import ContentPageItem from "../contentPageItem";

const LoadingItem = () => (
  <ContentPageItem
    item={{
      _id: "0",
      _ts: Date.now(),
      url: "https://loading.com",
      content: {
        title: "Loading...",
      },
    }}
    className="bg-gray-200"
  />
);

export default LoadingItem;
