// @flow
const scopeRe = /.*?\((.*?)\)/;

export default (
  scope: string,
  message: string
): boolean => {
  if (!message) {
    return false;
  }
  const match = message.match(scopeRe);
  return Boolean(match && match[1] && (match[1].trim() === scope));
};
