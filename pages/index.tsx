import React, { useState } from "react";
import Header from "../components/header";
import Wrapper from "../components/wrapper";
import requireAuth from "../lib/requireAuth";
import {
  usePaginatedContentList,
  getResultObject,
} from "../lib/usePaginatedContentList";
import { SaveBar } from "../components/saveBar";
import ContentPageItem from "../components/contentPageItem";
import Link from "next/link";
import LoadingItem from "../components/loading/LoadingItem";
import NoAuthIndex from "../components/index/noAuthIndex";

const MOST_RECENT_ITEM_LIMIT = 10;

const PreviewContentList = ({ data }) => {
  const resultObject = getResultObject(data.data);

  const mostRecentContentItems = resultObject.data.slice(
    0,
    MOST_RECENT_ITEM_LIMIT
  );

  return (
    <div>
      {mostRecentContentItems.length > 0 ? (
        mostRecentContentItems.map((item) => {
          return <ContentPageItem key={item._id} item={item} />;
        })
      ) : (
        <div className="px-4">None! Save some content.</div>
      )}
    </div>
  );
};

const IndexPreviewContent = () => {
  const { data } = usePaginatedContentList({ cursor: null });

  return (
    <>
      <Wrapper className="pb-0">
        <h3 className="flex justify-between items-center">
          <span>Recent content</span>
          <Link href="/my-content">
            <a>
              <small>View all</small>
            </a>
          </Link>
        </h3>
      </Wrapper>
      <Wrapper className="pt-0" flush>
        {data ? <PreviewContentList data={data} /> : <LoadingItem />}
      </Wrapper>
      <style jsx>{`
        h3 a {
          font-weight: 500;
          color: var(--c1);
        }
      `}</style>
    </>
  );
};

const IndexWithAuth = () => {
  const [saveMode, updateSaveMode] = useState(false);

  return (
    <>
      <Header />
      <Wrapper className="align-center">
        <div className="flex items-start justify-between">
          <h1 className="mt-0">Backyard</h1>
          <button
            className="bg-black m-0 mt-2"
            onClick={() => updateSaveMode(!saveMode)}
          >
            {saveMode ? "Exit" : "Save"}
          </button>
        </div>
        {saveMode && (
          <div className="my-4 w-full">
            <SaveBar />
          </div>
        )}
      </Wrapper>
      <IndexPreviewContent />
    </>
  );
};

const IndexComponent = requireAuth(IndexWithAuth, NoAuthIndex);

const Index = () => {
  return (
    <div>
      <IndexComponent />
    </div>
  );
};

export default Index;
