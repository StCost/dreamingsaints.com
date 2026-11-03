(function () {
  var canvas = document.getElementById("dream");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var sources = [
    "media/aqua-1.jpg",
    "media/aqua-2.jpg",
    "media/aqua-3.jpg",
    "media/whomers-capsule.jpg",
    "media/bone-hero.jpg",
    "media/bone-capsule.jpg",
    "media/collapse-capsule.jpg",
    "media/aqua-capsule.jpg"
  ];
  var images = [];
  var loaded = 0;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var start = performance.now();
  var hold = 7.5;

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
    var zoom = 1.12 + Math.sin(t * 0.17) * 0.03;
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
    var slices = reduce ? 1 : 18;
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
        ctx.drawImage(buffer, 0, sy, canvas.width, sheight, wave, sy, canvas.width, sheight);
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
    g.addColorStop(0, "rgba(28,24,20,0)");
    g.addColorStop(1, "rgba(20,16,12,0.45)");
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
    var t = (now - start) / 1000;
    ctx.fillStyle = "#14110e";
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
    if (!reduce) requestAnimationFrame(frame);
  }

  sources.forEach(function (src) {
    var img = new Image();
    img.onload = function () {
      images.push(img);
      loaded += 1;
      if (loaded === 1) requestAnimationFrame(frame);
    };
    img.src = src;
  });

  resize();
  seedFlakes();
  window.addEventListener("resize", function () {
    resize();
    seedFlakes();
  });
})();
