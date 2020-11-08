import { withRouter } from "next/router";
import Header from "../components/header";
import SaveUrl from "../components/saveUrl";
import Wrapper from "../components/wrapper";
import requireAuth from "../lib/requireAuth";
import AuthInteraction from "../components/authInteraction";

const SaveUrlWrapper = requireAuth(
  ({ urlString }) => (
    <div>{!!urlString && <SaveUrl urlString={urlString} />}</div>
  ),
  ({ urlString }) => (
    <div>
      <h1>Log in to save</h1>
      <div>
        <textarea
          className="form-input w-full mb-4"
          value={urlString}
          readOnly
        />
        <AuthInteraction />
      </div>
    </div>
  )
);

const Save = ({ router }) => {
  const urlString = router.query.url;

  return (
    <div>
      <Header />
      <Wrapper>
        <SaveUrlWrapper urlString={urlString} />
      </Wrapper>
    </div>
  );
};

export default withRouter(Save);
