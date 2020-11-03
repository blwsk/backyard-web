export const doAsyncThing = async (
  fn: Function
): Promise<[any, Error | null, string]> => {
  let result = null;
  let error = null;
  let errorMessage = "";

  try {
    const promise = fn();
    result = await promise;
  } catch (e) {
    error = e;
    errorMessage = e.message;
  }

  return [result, error, errorMessage];
};
