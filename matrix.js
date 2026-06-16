(function () {
  "use strict";

  const canvas = document.getElementById("matrix");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // on phones the full-screen opaque terminal covers the rain — skip it
  if (window.matchMedia("(max-width: 640px)").matches) return;

  const ctx = canvas.getContext("2d");
  const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789ABCDEF<>=*+#%$".split("");
  const FONT = 14;
  let cols, drops;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.ceil(canvas.width / FONT);
    drops = new Array(cols).fill(0).map(() => Math.floor(Math.random() * -60));
  }
  resize();
  window.addEventListener("resize", resize);

  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  let last = 0;

  function draw(t) {
    requestAnimationFrame(draw);
    if (document.hidden) return;
    if (t - last < 55) return;
    last = t;

    ctx.fillStyle = "rgba(5, 8, 5, 0.10)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = FONT + "px monospace";

    for (let i = 0; i < cols; i++) {
      const x = i * FONT;
      const y = drops[i] * FONT;
      ctx.fillStyle = "rgba(180, 255, 205, 0.95)";
      ctx.fillText(rnd(GLYPHS), x, y);
      ctx.fillStyle = "rgba(57, 255, 138, 0.30)";
      ctx.fillText(rnd(GLYPHS), x, y - FONT);

      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  requestAnimationFrame(draw);
})();
