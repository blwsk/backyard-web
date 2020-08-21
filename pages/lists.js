import Header from "../components/header";
import Wrapper from "../components/wrapper";
import { withRouter } from "next/router";

const Lists = ({ router }) => {
  const { id } = router.query;

  return (
    <div>
      <Header />
      <Wrapper>
        <h1>Lists</h1>
        <p>{id}</p>
      </Wrapper>
    </div>
  );
};

export default withRouter(Lists);
