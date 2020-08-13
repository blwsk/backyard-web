import { withRouter } from "next/router";
import { useAuth } from "../lib/useAuth";
import Header from "../components/header";
import SaveUrl from "../components/saveUrl";
import Login from "../components/login";
import Wrapper from "../components/wrapper";

const Save = ({ router }) => {
  const urlString = router.query.url;

  const { isAuthenticated } = useAuth();

  return (
    <div>
      <Header />
      <Wrapper>
        {isAuthenticated ? (
          !!urlString && <SaveUrl urlString={urlString} />
        ) : (
          <Login />
        )}
      </Wrapper>
    </div>
  );
};

export default withRouter(Save);
