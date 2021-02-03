import { newrelic } from "./newrelic";

export const withTelemetry = (
  fn: (...args: any[]) => Promise<unknown>
): ((...args: any[]) => Promise<unknown>) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      const start = window.performance.now();
      fn(...args)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          const end = window.performance.now();

          newrelic().addPageAction("telemetry", {
            start,
            end,
            delta: end - start,
            ...args,
          });
        });
    });
  };
};
