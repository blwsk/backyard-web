export const EMAIL = "email";
export const SMS = "sms";
export const MANUAL = "manual";
export const RSS = "rss";

export type ItemSource = "email" | "sms" | "manual" | "rss";

export interface ItemContent {
  body?: string;
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  json?: string;
}

export interface ItemOrigin {
  emailBody?: string;
  rssEntryContent?: string;
  rssFeedUrl?: string;
}

export interface Item {
  url?: string;
  createdBy: string;
  createdAt: number;
  content?: ItemContent;
  source?: ItemSource;
  origin?: ItemOrigin;
}
