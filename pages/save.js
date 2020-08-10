import { withRouter } from "next/router";
import { validURL } from "../lib/urls";
import { useAuth } from "../lib/useAuth";
import Data from "../components/data";
import gql from "gql-tag";
import { mutation } from "../lib/mutation";
import { useState, useEffect } from "react";
import Header from "../components/header";

const Login = () => {
  return (
    <div>
      <h1>Login to save</h1>
      <section>
        <article>
          <p>Before you can save this awesome content, please login.</p>
          <button>Send me a magic link ✨</button>
        </article>
      </section>
    </div>
  );
};

const SaveUrl = ({ urlString }) => {
  const decodedUrl = decodeURIComponent(urlString);
  const isValid = validURL(decodedUrl);

  const [saveState, updateSaveState] = useState({
    loading: false,
    saved: false,
    data: null,
    error: null,
    message: null,
  });

  useEffect(() => {
    if (isValid) {
      const query = gql`
        mutation {
          createItem(
            data: {
              url: "${decodedUrl}"
            }
          ) {
            url
          }
        }
      `;

      updateSaveState({ ...saveState, loading: true, message: "Saving..." });

      mutation(query)
        .then((res) => {
          updateSaveState({
            ...saveState,
            saved: true,
            data: res,
            loading: false,
            error: false,
            message: "Saved.",
          });
        })
        .catch((err) => {
          try {
            const alreadySaved = err.errors.some(
              (error) => error.message.indexOf("not unique") > 0
            );
            if (alreadySaved) {
              updateSaveState({
                ...saveState,
                saved: true,
                data: null,
                loading: false,
                error: false,
                message: "Already saved.",
              });

              return;
            }
          } catch (e) {
            void e;
          }

          updateSaveState({
            ...saveState,
            error: err,
            saved: false,
            loading: false,
            message: "Error.",
          });
        });
    }
  }, []);

  return (
    <>
      <section
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        {saveState.message && (
          <h1 className={saveState.error ? "color-red" : undefined}>
            {saveState.message}
          </h1>
        )}
      </section>
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isValid ? (
            <Data
              rawUrl={urlString}
              url={urlString}
              renderPlaceholder={() => <h2>{decodedUrl}</h2>}
            />
          ) : (
            <div className="color-red">Error. URL is invalid.</div>
          )}
        </div>
      </div>
    </>
  );
};

const Save = ({ router }) => {
  const urlString = router.query.url;

  const { isAuthenticated } = useAuth();

  return (
    <div>
      <Header />
      <div className="column m-all-4 p-all-2">
        {isAuthenticated ? (
          !!urlString && <SaveUrl urlString={urlString} />
        ) : (
          <Login />
        )}
      </div>
    </div>
  );
};

export default withRouter(Save);
