import { gqlFetcher } from "./fetcher";

export const mutation = (query) => gqlFetcher(query)("/api/graphql");
