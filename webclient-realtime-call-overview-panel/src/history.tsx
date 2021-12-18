export function initHistory() {
  // overwrite push/replace methods to add locationchange event
  const pushState = window.history.pushState;
  window.history.pushState = function(...args) {
    let ret = pushState.apply(this, args);
    window.dispatchEvent(new Event('pushstate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  };

  const replaceState = window.history.pushState;
  window.history.replaceState = function(...args) {
    let ret = replaceState.apply(this, args);
    window.dispatchEvent(new Event('replacestate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  };

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'))
  });
}

export function goTo(target: string) {
  window.location.assign(target);
  window.dispatchEvent(new Event('locationchange'));
}