export const EMAIL = "email";
export const SMS = "sms";
export const MANUAL = "manual";

export type ItemSource = "email" | "sms" | "manual";

export interface ItemContent {
  body: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  json: string;
}

export interface ItemOrigin {
  emailBody?: string;
}

export interface Item {
  url: string;
  createdBy: string;
  createdAt: number;
  content?: ItemContent;
  source?: ItemSource;
  origin?: ItemOrigin;
}
