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
    backgroundColor="var(--c4)"
  />
);

export default LoadingItem;
