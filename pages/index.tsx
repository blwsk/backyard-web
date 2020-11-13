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
import Link from "next/link";
import LoadingItem from "../components/loading/LoadingItem";

const MOST_RECENT_ITEM_LIMIT = 5;

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
              <small>View All</small>
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
  return (
    <>
      <Wrapper className="align-center">
        <h1 className="text-center">Backyard</h1>
        <div className="my-4 w-full">
          <SaveBar />
        </div>
      </Wrapper>
      <IndexPreviewContent />
    </>
  );
};

const NoAuthIndex = () => {
  return (
    <>
      <Wrapper className="align-center">
        <h1 className="text-center">Backyard</h1>
      </Wrapper>
      <Wrapper>
        <div className="well mb-4">
          <h3>Save content easily</h3>
          <p>
            Subscribe to newsletters with a free email address. Get notified via
            text when a new post arrives. Send links to the same phone number to
            save them. Drag and drop files anywhere to save them.
          </p>
        </div>
        <div className="well mb-4">
          <h3>Highlight and annotate quickly</h3>
          <p>
            Keep track of the most important parts of an article. Record your
            thoughts on an article with inline annotations.
          </p>
        </div>
        <div className="well mb-4">
          <h3>Search everything</h3>
          <p>
            Search across full article text and metadata, highlights, and notes.
          </p>
        </div>
        <div className="well mb-4">
          <h3>Organize your content into queues.</h3>
          <p>
            Don't worry about forgetting what you want to read next. Find a
            piece in your queue. Split up content into queues based on content
            type, topic, source, etc.
          </p>
        </div>
      </Wrapper>
    </>
  );
};

const IndexComponent = requireAuth(IndexWithAuth, NoAuthIndex);

const Index = () => {
  return (
    <div>
      <Header />
      <IndexComponent />
    </div>
  );
};

export default Index;
