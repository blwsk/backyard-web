export interface ClipExportData {
  _id: string;
  createdAt: number;
  createdBy: string;
  itemId?: string;
  objectID: string;
  text: string;
}

export interface ItemExportData {
  _id: string;
  _ts: string;
  url: string;
  content?: {
    title?: string;
    metaTitle?: string;
    metaDescription?: string;
    body?: string;
  };
  objectID: string;
}
