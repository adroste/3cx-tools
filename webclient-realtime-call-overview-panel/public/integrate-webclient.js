(() => {
  fetch('/webclient/tcx-tools-panel-app/index.html')
    .then((res) => res.text())
    .then((indexHtml) => {
      const cssRe = /href="(\/webclient\/tcx-tools-panel-app\/.+\.css)"/;
      const scriptRe = /src="(\/webclient\/tcx-tools-panel-app\/.+\.js)"/;
      const cssHref = cssRe.exec(indexHtml);
      const scriptSrc = scriptRe.exec(indexHtml);

      const css = document.createElement('link');
      css.href = cssHref[1];
      css.rel = 'stylesheet';
      const script = document.createElement('script');
      script.src = scriptSrc[1];

      document.body.appendChild(css);
      document.body.appendChild(script);
    });
})();
