import { withRouter } from "next/router";
import Header from "../components/header";
import SaveUrl from "../components/saveUrl";
import Wrapper from "../components/wrapper";
import requireAuth from "../lib/requireAuth";

const Save = ({ router }) => {
  const urlString = router.query.url;

  return (
    <div>
      <Header />
      <Wrapper>{!!urlString && <SaveUrl urlString={urlString} />}</Wrapper>
    </div>
  );
};

export default requireAuth(withRouter(Save));