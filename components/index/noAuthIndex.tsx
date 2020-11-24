import Header from "../header";
import Wrapper from "../wrapper";
import { FORM_URL } from "../../lib/hubspotConstants";

const NoAuthIndex = () => {
  return (
    <>
      <Header />
      <Wrapper className="items-center">
        <h1 className="text-center pt-10 pb-5 md:pt-20 md:mb-20 text-orange">
          Your digital library
        </h1>
        <h2 className="text-center">
          Save anything, search everything, keep forever
        </h2>
        <p className="text-center mb-6 md:mb-12">
          Subscribe to <b>newsletters</b> with a special email address. Send
          links via <b>SMS</b> to store them. Never lose track of what you’ve
          saved. It’s all here, <b>instantly searchable</b>.
        </p>
        <a href={FORM_URL} target="_blank">
          <button className="text-lg bg-orange text-white font-semibold py-3 px-5">
            Request access
          </button>
        </a>
      </Wrapper>
      <style jsx>{`
        h1 {
          font-size: 48px;
        }
        h2 {
          font-size: 24px;
        }
        p {
          width: 460px;
          max-width: 100%;
          line-height: 1.5em;
        }
      `}</style>
    </>
  );
};

export default NoAuthIndex;
