import { Readability } from "@mozilla/readability";

export const getParsedOriginEmail = (originEmailBody?: string): string => {
  const doc = document.implementation.createHTMLDocument();
  const body = doc.createElement("body");
  body.innerHTML = originEmailBody;

  try {
    doc.body.appendChild(body);
  } catch (e) {
    console.log(e);
    return null;
  }

  const reader = new Readability(doc);
  const parsed = reader ? reader.parse() : null;

  return parsed ? parsed.content : null;
};
