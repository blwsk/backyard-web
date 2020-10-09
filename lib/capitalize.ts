export const capitalize = (s) => {
  if (typeof s !== "string") return "";
  const l = s.toLowerCase();
  return l.charAt(0).toUpperCase() + l.slice(1);
};
