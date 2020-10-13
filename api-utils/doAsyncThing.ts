export const doAsyncThing = async (fn) => {
  let result = null;
  let error = null;
  let errorMessage = "";

  try {
    result = await fn();
  } catch (e) {
    error = e;
    errorMessage = e.message;
  }

  return [result, error, errorMessage];
};
