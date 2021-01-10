// https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url

const URL_PARSER_EXP = /^(https?:\/\/)((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+@]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;

export function validURL(str) {
  return URL_PARSER_EXP.test(str);
}

const HOSTNAME_EXP = /^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i;

export function getHostname(str) {
  const matches = str.match(HOSTNAME_EXP);
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
