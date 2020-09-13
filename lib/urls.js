// https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
export function validURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

export function getHostname(str) {
  const matches = str.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
  return matches && matches[0] && matches[1]
    ? {
        withProtocol: matches[0],
        hostname: matches[1],
      }
    : {};
}

export function stripParams(str) {
  const { hostname, pathname } = new URL(str);
  return `${hostname}${pathname}`;
}

export function ensureProtocol(str) {
  return str;
  // if (str.indexOf("http") > -1) {
  //   return;
  // }

  // try {
  // } catch (error) {}
}
