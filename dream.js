(function () {
  var canvas = document.getElementById("dream");
  var hero = document.querySelector(".hero");
  if (!canvas || !hero) return;
  var ctx = canvas.getContext("2d");
  var flakes = [];
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function make(n) {
    flakes = [];
    for (var i = 0; i < n; i++) {
      flakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        w: 2 + Math.random() * 7,
        h: 6 + Math.random() * 16,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.01,
        vy: 0.15 + Math.random() * 0.45,
        vx: -0.25 + Math.random() * 0.2,
        kind: Math.random() < 0.72 ? "leaf" : "chip",
        tint: Math.random() < 0.78 ? "rgba(228,194,122,0.45)" : "rgba(255,128,0,0.35)"
      });
    }
  }

  function drawShaft() {
    var g = ctx.createLinearGradient(canvas.width * 0.22, 0, canvas.width * 0.48, canvas.height);
    g.addColorStop(0, "rgba(255, 220, 170, 0.05)");
    g.addColorStop(0.5, "rgba(255, 200, 140, 0.015)");
    g.addColorStop(1, "rgba(255, 200, 140, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.18, 0);
    ctx.lineTo(canvas.width * 0.34, 0);
    ctx.lineTo(canvas.width * 0.52, canvas.height);
    ctx.lineTo(canvas.width * 0.22, canvas.height);
    ctx.fill();
  }

  function drawFlake(f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rot);
    ctx.fillStyle = f.tint;
    ctx.beginPath();
    if (f.kind === "leaf") {
      ctx.moveTo(0, -f.h * 0.5);
      ctx.quadraticCurveTo(f.w, 0, 0, f.h * 0.5);
      ctx.quadraticCurveTo(-f.w * 0.65, 0, 0, -f.h * 0.5);
    } else {
      ctx.moveTo(-f.w, -f.h * 0.2);
      ctx.lineTo(f.w * 0.4, -f.h * 0.5);
      ctx.lineTo(f.w, f.h * 0.15);
      ctx.lineTo(-f.w * 0.2, f.h * 0.45);
    }
    ctx.fill();
    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShaft();
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      if (!reduce) {
        f.y += f.vy;
        f.x += f.vx;
        f.rot += f.vr;
        if (f.y > canvas.height + 30) {
          f.y = -20;
          f.x = Math.random() * canvas.width;
        }
      }
      drawFlake(f);
    }
    if (!reduce) requestAnimationFrame(frame);
  }

  hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
    hero.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
  });

  resize();
  make(Math.round(window.innerWidth / 18));
  frame();
  window.addEventListener("resize", function () {
    resize();
    make(Math.round(window.innerWidth / 18));
  });
})();
