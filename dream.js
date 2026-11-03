(function () {
  var canvas = document.getElementById("dream");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var sources = [
    "media/aqua-1.webp",
    "media/bone-hero.webp",
    "media/collapse-capsule.webp",
    "media/whomers-capsule.webp",
    "media/aqua-2.webp",
    "media/bone-capsule.webp"
  ];
  var images = [];
  var loaded = 0;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var start = performance.now();
  var hold = 7.5;
  var low = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 2;
  var visible = true, running = false, last = 0;

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  }

  function cover(target, img, t) {
    var w = canvas.width;
    var h = canvas.height;
    var ir = img.width / img.height;
    var cr = w / h;
    var zoom = 1.16 + Math.sin(t * 0.17) * 0.03;
    var dw, dh;
    if (ir > cr) {
      dh = h * zoom;
      dw = dh * ir;
    } else {
      dw = w * zoom;
      dh = dw / ir;
    }
    var dx = (w - dw) / 2 + Math.sin(t * 0.11) * w * 0.02;
    var dy = (h - dh) / 2 + Math.cos(t * 0.09) * h * 0.02;
    target.drawImage(img, dx, dy, dw, dh);
  }

  function dream(img, t, alpha) {
    if (!img || alpha <= 0) return;
    var buffer = dream.buffer;
    if (!buffer) {
      buffer = dream.buffer = document.createElement("canvas");
      dream.bctx = buffer.getContext("2d");
    }
    if (buffer.width !== canvas.width || buffer.height !== canvas.height) {
      buffer.width = canvas.width;
      buffer.height = canvas.height;
    }
    var bctx = dream.bctx;
    bctx.clearRect(0, 0, buffer.width, buffer.height);
    cover(bctx, img, t);
    var slices = reduce ? 1 : (low ? 6 : 10);
    var sh = canvas.height / slices;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (slices === 1) {
      ctx.drawImage(buffer, 0, 0);
    } else {
      for (var i = 0; i < slices; i++) {
        var wave = Math.sin(t * 0.85 + i * 0.38) * canvas.width * 0.012;
        var sy = Math.floor(i * sh);
        var sheight = Math.ceil(sh) + 1;
        ctx.drawImage(buffer, 0, sy, canvas.width, sheight, wave - canvas.width * 0.02, sy, canvas.width * 1.04, sheight);
      }
    }
    ctx.restore();
  }

  var flakes = [];
  function seedFlakes() {
    flakes = [];
    var n = Math.round(canvas.width / 28);
    for (var i = 0; i < n; i++) {
      flakes.push({
        x: Math.random(),
        y: Math.random(),
        s: 1.5 + Math.random() * 4,
        v: 0.008 + Math.random() * 0.02,
        rot: Math.random() * Math.PI
      });
    }
  }

  function veil(t) {
    var g = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.45, canvas.width * 0.15,
      canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.75
    );
    g.addColorStop(0, "rgba(28,24,20,0.25)");
    g.addColorStop(1, "rgba(20,16,12,0.7)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (reduce) return;
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.y -= f.v * 0.35;
      if (f.y < -0.02) f.y = 1.02;
      f.rot += 0.01;
      var x = f.x * canvas.width;
      var y = f.y * canvas.height + Math.sin(t + i) * 6;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(f.rot);
      ctx.fillStyle = i % 3 === 0 ? "rgba(232,215,168,0.75)" : "rgba(176,137,72,0.55)";
      ctx.fillRect(-f.s, -f.s * 0.35, f.s * 2, f.s * 0.7);
      ctx.restore();
    }
  }

  function frame(now) {
    if (!visible || document.hidden) { running = false; return; }
    if (now - last < 33) { requestAnimationFrame(frame); return; }
    last = now;
    var t = (now - start) / 1000;
    ctx.fillStyle = "#1c1814";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (images.length) {
      var index = Math.floor(t / hold) % images.length;
      var next = (index + 1) % images.length;
      var local = (t % hold) / hold;
      var fade = local > 0.78 ? (local - 0.78) / 0.22 : 0;
      if (reduce) fade = 0;
      dream(images[index], t, 1);
      if (fade > 0) dream(images[next], t + 1.7, fade);
    }
    veil(t);
    if (!reduce) requestAnimationFrame(frame); else running = false;
  }

  function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }
  var i0 = 0;
  function loadNext() {
    if (i0 >= sources.length) return;
    var img = new Image();
    img.onload = function () {
      images.push(img);
      loaded += 1;
      if (loaded === 1) kick();
      if (!reduce) setTimeout(loadNext, 400);
    };
    img.src = sources[i0++];
  }
  loadNext();
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible && !reduce) kick(); }).observe(canvas);
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && !reduce) kick(); });
  var btn = document.querySelector(".menu"), bar = document.querySelector(".nav");
  if (btn) {
    btn.addEventListener("click", function () { var o = bar.classList.toggle("open"); btn.setAttribute("aria-expanded", o); });
    bar.querySelectorAll("nav a").forEach(function (a) { a.addEventListener("click", function () { bar.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }); });
  }

  resize();
  seedFlakes();
  window.addEventListener("resize", function () {
    resize();
    seedFlakes();
  });
})();
