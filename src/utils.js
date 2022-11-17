export function fetchSource(url) {
  return fetch(url).then((res) => res.text());
}
