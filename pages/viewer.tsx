import { withRouter } from "next/router";
import Header from "../components/header";
import Data from "../components/data";
import Wrapper from "../components/wrapper";

const Viewer = ({ router }) => {
  const { id: itemId } = router.query;

  return (
    <div>
      <Header />
      <Wrapper>
        <Data itemId={itemId} />
      </Wrapper>
    </div>
  );
};

export default withRouter(Viewer);
