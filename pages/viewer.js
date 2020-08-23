import { withRouter } from "next/router";
import Header from "../components/header";
import Data from "../components/data";
import { validURL } from "../lib/urls";
import Wrapper from "../components/wrapper";

const Viewer = ({ router }) => {
  const { url: urlString, id: itemId } = router.query;

  const decodedUrl = decodeURIComponent(urlString);

  return (
    <div>
      <Header />
      <Wrapper>
        {validURL(decodedUrl) && (
          <Data
            rawUrl={urlString}
            url={decodedUrl}
            itemId={itemId}
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
