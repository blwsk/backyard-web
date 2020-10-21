const REQUEST_URI =
  process.env.NODE_ENV === "development"
    ? `http://localhost:3001/api/index`
    : "https://backyard-data.vercel.app/api/index";

/*
"url": url,
"body": returnable_main_content,
"title": title,
"metaTitle": meta_title,
"metaDescription": meta_description,
*/

export const fetchTextContent = async ({ url }) => {
  let result;
  let error;
  try {
    const res = await fetch(REQUEST_URI, {
      method: "PUT",
      body: JSON.stringify({
        url,
      }),
    });
    result = await res.json();
  } catch (err) {
    error = err;
  }

  return { result, error };
};
