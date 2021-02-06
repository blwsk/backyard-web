import { withRouter } from "next/router";
import Header from "../components/header";
import Data from "../components/data";
import Wrapper from "../components/wrapper";
import requireAuth from "../lib/requireAuth";

const Viewer = ({ router }) => {
  const { id: itemId } = router.query;

  return (
    <div>
      <Header />
      <Wrapper>{itemId && <Data itemId={itemId} />}</Wrapper>
    </div>
  );
};

export default requireAuth(withRouter(Viewer));
