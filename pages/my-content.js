import gql from "gql-tag";
import useSWR from "swr";
import { gqlFetcher } from "../lib/fetcher";
import Header from "../components/header";
import { stripParams } from "../lib/urls";

const MyContent = () => {
  const { data, error, isValidating } = useSWR(
    "/api/graphql",
    gqlFetcher(gql`
      query {
        allItems {
          data {
            url
            _id
          }
        }
      }
    `)
  );

  const isLoading = !data && isValidating;

  const items = data && data.data.allItems.data;

  return (
    <div>
      <Header />
      <div className="m-all-4 p-all-2">
        <section
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <h1>My Content</h1>
        </section>
        {isLoading && <h2>Loading...</h2>}
        {data && (
          <div>
            <div style={{ wordBreak: "break-word" }}>
              {items.map((item) => {
                return (
                  <div key={item._id} className="p-y-2">
                    <a href={`/viewer?url=${encodeURI(item.url)}`}>
                      {stripParams(item.url)}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {error && <div style={{ color: "red" }}>Oops. Refresh the page.</div>}
      </div>
    </div>
  );
};

export default MyContent;
