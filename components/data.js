import useSWR from "swr";
import { jsonFetcher } from "../lib/fetcher";
import { getHostname } from "../lib/urls";

const Data = ({ url, renderPlaceholder }) => {
  const { data, error } = useSWR(`/api/html?url=${url}`, jsonFetcher);

  const { hostname, withProtocol } = getHostname(url);

  return (
    <div className="background-gray" style={{ maxWidth: 800, padding: 40 }}>
      <div>
        {data ? (
          <div>
            <h2>{data.metaTitle}</h2>
            <h3>{data.metaDescription}</h3>
            {hostname && (
              <div>
                <a href={withProtocol}>{hostname}</a>
              </div>
            )}
          </div>
        ) : (
          renderPlaceholder()
        )}
      </div>
    </div>
  );
};
export default Data;
