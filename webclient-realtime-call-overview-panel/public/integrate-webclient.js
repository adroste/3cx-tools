(() => {
  fetch('/webclient/tcx-tools-panel-app/index.html')
    .then((res) => res.text())
    .then((indexHtml) => {
      const cssRe = /href="(\/webclient\/tcx-tools-panel-app\/static\/css\/[a-zA-Z0-9.]+\.css)"/;
      const scriptRe = /src="(\/webclient\/tcx-tools-panel-app\/static\/js\/[a-zA-Z0-9.]+\.js)"/;
      const cssHref = cssRe.exec(indexHtml);
      const scriptSrc = scriptRe.exec(indexHtml);

      const css = document.createElement('link');
      css.href = cssHref[1];
      css.rel = 'stylesheet';
      const script = document.createElement('script');
      script.src = scriptSrc[1];

      setTimeout(() => {
        document.body.appendChild(css);
        document.body.appendChild(script);
      }, 1000);
    });
})();
