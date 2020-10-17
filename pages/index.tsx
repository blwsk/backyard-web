import React from "react";
import Header from "../components/header";
import Wrapper from "../components/wrapper";
import requireAuth from "../lib/requireAuth";
import {
  usePaginatedContentList,
  getResultObject,
} from "../lib/usePaginatedContentList";
import { SaveBar } from "../components/saveBar";
import ContentPageItem from "../components/contentPageItem";

const MOST_RECENT_ITEM_LIMIT = 5;

const RecentContent = () => {
  const { data } = usePaginatedContentList({ cursor: null });

  if (!data) {
    return null;
  }

  const resultObject = getResultObject(data.data);

  const mostRecentContentItems = resultObject.data.slice(
    0,
    MOST_RECENT_ITEM_LIMIT
  );

  return (
    <div>
      <h3>Recent content</h3>
      {mostRecentContentItems.length > 0 ? (
        mostRecentContentItems.map((item) => {
          return <ContentPageItem key={item._id} item={item} />;
        })
      ) : (
        <div>None! Save some content.</div>
      )}
    </div>
  );
};

const NoAuthComponent = () => null;

const RecentContentWithAuth = requireAuth(RecentContent, NoAuthComponent);

const Index = () => {
  return (
    <div>
      <Header />
      <Wrapper align="center">
        <h1>Backyard</h1>
        <br />
        <SaveBar />
      </Wrapper>
      <Wrapper>
        <RecentContentWithAuth />
      </Wrapper>
    </div>
  );
};

export default Index;
