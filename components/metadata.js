import useSWR from "swr";
import { jsonParser } from "../lib/fetcher";
import { getHostname } from "../lib/urls";
import Link from "next/link";

export const fetcher = (path, options) => {
  return fetch(path, options).then(jsonParser);
};

const Metadata = ({ url, rawUrl, renderPlaceholder }) => {
  const { data, error } = useSWR(
    `https://backyard-data.vercel.app/api/simple?url=${rawUrl}`,
    // `http://localhost:3001/api/simple?url=${rawUrl}`,
    fetcher
  );

  const { hostname } = getHostname(url);

  return (
    <div>
      {error && (
        <div className="color-red">
          Something went wrong. Try refreshing the page.
        </div>
      )}
      {data ? (
        <div>
          <h2>{data.metaTitle || data.title}</h2>
          <h3>{data.metaDescription}</h3>
          {hostname && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{hostname}</span>
              <a href={url}>Original</a>
            </div>
          )}
          <br />
          <hr />
          <br />
          <div>
            <Link href={`/viewer?url=${rawUrl}`}>
              <button>View now</button>
            </Link>
          </div>
        </div>
      ) : (
        renderPlaceholder()
      )}
    </div>
  );
};
export default Metadata;
