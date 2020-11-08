export const classNames = (...args) =>
  args
    .map((arg) => {
      switch (true) {
        case typeof arg === "string":
          return arg;
        case typeof arg === "object":
          return Object.keys(arg)
            .reduce((acc, key) => {
              if (arg[key]) {
                return [...acc, key];
              }
              return acc;
            }, [])
            .join(" ");
        default:
          return "";
      }
    })
    .join(" ");
