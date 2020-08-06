import { withRouter } from "next/router";
import Header from "../components/header";
import Data from "../components/data";
import { validURL } from "../lib/urls";

const Viewer = ({ router }) => {
  const urlString = router.query.url;

  const decodedUrl = decodeURIComponent(urlString);

  return (
    <div>
      <Header />
      <div className="m-all-4 column p-all-2">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {validURL(decodedUrl) && (
            <Data
              url={decodedUrl}
              renderPlaceholder={() => <h2>{decodedUrl}</h2>}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default withRouter(Viewer);
