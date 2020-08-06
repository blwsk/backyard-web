import gql from "gql-tag";
import useSWR from "swr";
import { gqlFetcher } from "../lib/fetcher";
import Header from "../components/header";

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
            <ul>
              {items.map((item) => {
                return (
                  <li key={item._id}>
                    <a href={`/viewer?url=${encodeURI(item.url)}`}>
                      {item.url}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {error && <div style={{ color: "red" }}>Oops. Refresh the page.</div>}
      </div>
    </div>
  );
};

export default MyContent;
