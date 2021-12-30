export function getLanguage() {
  return localStorage.getItem('NG_TRANSLATE_LANG_KEY');
}

export function removeSearchParamsFromUrl(url: string) {
  const pos = url.indexOf('?');
  if (pos !== -1)
    return url.slice(0, pos);
  return url;
}