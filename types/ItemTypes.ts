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

export interface EmailJson {
  to: string;
  from: string;
  subject?: string;
  html: string;
  envelope: string;
}

export interface ItemContent {
  body?: string;
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  json?: object | EmailJson;
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
