import { withRouter } from "next/router";
import Header from "../components/header";
import Data from "../components/data";
import { validURL } from "../lib/urls";
import Wrapper from "../components/wrapper";

const Viewer = ({ router }) => {
  const urlString = router.query.url;

  const decodedUrl = decodeURIComponent(urlString);

  return (
    <div>
      <Header />
      <Wrapper>
        {validURL(decodedUrl) && (
          <Data
            rawUrl={urlString}
            url={decodedUrl}
            renderPlaceholder={() => (
              <div style={{ wordBreak: "break-word" }}>
                <h2>{decodedUrl}</h2>
              </div>
            )}
          />
        )}
      </Wrapper>
    </div>
  );
};

export default withRouter(Viewer);
