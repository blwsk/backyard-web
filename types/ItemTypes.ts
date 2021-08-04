export const EMAIL = "email";
export const SMS = "sms";
export const MANUAL = "manual";
export const RSS = "rss";

export type ItemSource = "email" | "sms" | "manual" | "rss";

export const isEmailJson = (emailJsonMaybe: {
  to?: string;
  from?: string;
  subject?: string;
}): boolean => {
  return (
    typeof emailJsonMaybe.to === "string" &&
    typeof emailJsonMaybe.from === "string"
  );
};

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
}

export interface Tweet {
  author_id: string;
  id: string;
  created_at: string;
}

export interface TweetJson {
  data: Tweet[];
  includes: {
    media: any[];
    users: TwitterUser[];
  };

  to?: never;
  from?: never;
  subject?: never;
  html?: never;
  envelope?: never;
}

export interface EmailJson {
  data?: never;
  includes?: never;

  to: string;
  from: string;
  subject?: string;
  html: string;
  envelope: string;
}

export type ItemJson = TweetJson | EmailJson;

export interface ItemContent {
  body?: string;
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  json?: ItemJson;
}

export interface ItemOrigin {
  emailBody?: string;
  rssEntryContent?: string;
  rssFeedUrl?: string;
}

export interface Item {
  id: string;
  legacyId: string;
  url?: string;
  createdBy: string;
  createdAt: number;
  content?: ItemContent;
  source?: ItemSource;
  origin?: ItemOrigin;
}

export interface ItemPreview {
  id: number;
  legacyId: bigint;
  title?: string;
  subtitle?: string;
  json?: TweetJson;
  source: ItemSource;
  domain?: string;
  createdAt: number;
  createdBy: string;
}
