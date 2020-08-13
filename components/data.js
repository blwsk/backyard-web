import useSWR from "swr";
import { jsonParser } from "../lib/fetcher";
import { getHostname } from "../lib/urls";

export const fetcher = (path, options) => {
  return fetch(path, options).then(jsonParser);
};

const Data = ({ url, rawUrl, renderPlaceholder }) => {
  const { data, error } = useSWR(
    // `https://backyard-data.vercel.app/api/index?url=${rawUrl}`,
    `http://localhost:3001/api/index?url=${rawUrl}`,
    fetcher
  );

  const { hostname, withProtocol } = getHostname(url);

  return (
    <div className="background-gray" style={{ maxWidth: 800, padding: 40 }}>
      <div>
        {error && (
          <div className="color-red">
            Something went wrong. Try refreshing the page.
          </div>
        )}
        {data ? (
          <div>
            <h2>{data.metaTitle}</h2>
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
            <div dangerouslySetInnerHTML={{ __html: data.body }} />
          </div>
        ) : (
          renderPlaceholder()
        )}
      </div>
    </div>
  );
};
export default Data;
