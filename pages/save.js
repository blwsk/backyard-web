import { withRouter } from "next/router";
import { validURL } from "../lib/urls";
import { useAuth } from "../lib/useAuth";

const Save = ({ router }) => {
  const urlString = router.query.url;
  const decodedUrl = decodeURIComponent(urlString);
  const isValid = validURL(decodedUrl);

  const { isAuthenticated, user } = useAuth();

  return (
    <div className="m-all-4 column p-all-2">
      <div>
        {isAuthenticated ? (
          <section
            style={{
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1>Saving...</h1>
            <div
              style={{
                background: "lightblue",
                borderRadius: "50%",
                padding: "10px",
                fontSize: "20px",
                height: "52px",
                width: "52px",
                justifyContent: "center",
                display: "flex",
                alignItems: "center",
              }}
            >
              {user.firstName[0] + user.lastName[0]}
            </div>
          </section>
        ) : (
          <div>
            <h1>Login to save</h1>
            <section>
              <article>
                <p>Before you can save this awesome content, please login.</p>
                <button>Send me a magic link ✨</button>
              </article>
            </section>
          </div>
        )}
        <section>
          <article>
            <h3>URL</h3>
            {isValid ? (
              <pre>{decodedUrl}</pre>
            ) : (
              <div style={{ color: "red" }}>Error. URL is invalid.</div>
            )}
          </article>
        </section>
      </div>
    </div>
  );
};

export default withRouter(Save);
