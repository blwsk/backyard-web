export const throttle = (fn: Function, wait: number = 500) => {
  let throttled: boolean = false;
  let throttledArgs;
  let timeout;

  return (...args) => {
    if (!throttled) {
      throttled = true;
      fn(...args);
    } else {
      throttledArgs = args;

      clearTimeout(timeout);

      timeout = setTimeout(() => {
        throttled = false;
        fn(...throttledArgs);
        throttledArgs = undefined;
      }, wait);
    }
  };
};
