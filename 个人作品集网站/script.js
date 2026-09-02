/* ============================================
   高琪 · AI 应用工程师作品集 — 交互脚本
   ============================================ */

/* ---------- 1. 鼠标跟随光圈（平滑跟随） ---------- */
(function () {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let curX = targetX;
  let curY = targetY;

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    glow.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });

  // 使用 lerp 插值实现柔和的"追随"感
  function animate() {
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    glow.style.transform = `translate(${curX - 300}px, ${curY - 300}px)`;
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ---------- 1.5 占位链接（暂无真实地址）禁用跳转 ---------- */
(function () {
  document.querySelectorAll('a[aria-disabled="true"]').forEach((a) => {
    a.addEventListener('click', (e) => e.preventDefault());
  });
})();

/* ---------- 2. 导航栏滚动状态 ---------- */
(function () {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

/* ---------- 3. 视频加载失败兜底 + 主动触发播放（兼容预览/嵌入式环境） ---------- */
(function () {
  const video = document.querySelector('.hero-video');
  if (video) {
    video.addEventListener('error', () => { video.style.display = 'none'; }, true);
    // 部分嵌入式/沙箱预览会拦截自动播放，主动尝试一次 play()，失败则静默忽略
    const tryPlay = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
    video.addEventListener('loadeddata', tryPlay, { once: true });
    tryPlay();
  }
})();

/* ---------- 4. 滚动进入动画 ---------- */
(function () {
  const targets = document.querySelectorAll(
    '.section-head, .about-avatar-col, .about-info-col, .project-card, .skill-card, .cf-content, .timeline-item, .tech-group'
  );
  targets.forEach((el) => el.classList.add('reveal'));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = `${(i % 4) * 0.08}s`;
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  targets.forEach((el) => io.observe(el));
})();

/* ---------- 5. 数字滚动动画 ---------- */
(function () {
  const nums = document.querySelectorAll('.stat-num');

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix ? el.dataset.prefix.replace('&lt;', '<') : '';
        const isFloat = String(el.dataset.target).includes('.');
        const dur = 1400;
        const start = performance.now();

        function tick(now) {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = target * eased;
          el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  nums.forEach((el) => io.observe(el));
})();

/* ---------- 6. Hero 标题逐字浮现（StaggeredFade） ---------- */
(function () {
  const title = document.querySelector('.hero-title');
  if (!title) return;
  const lines = title.querySelectorAll('.title-line[data-text]');
  if (!lines.length) return;

  let idx = 0;
  lines.forEach((line) => {
    const text = line.dataset.text;
    line.innerHTML = '';
    [...text].forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.innerHTML = ch === ' ' ? '&nbsp;' : ch;
      span.style.transitionDelay = (idx * 0.07).toFixed(2) + 's';
      line.appendChild(span);
      idx++;
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          title.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );
  io.observe(title);
})();

/* ---------- 7. Hero 液态玻璃揭示 + 真实水面涟漪（2D 水波模拟） ---------- */
(function () {
  const hero = document.getElementById('home');
  if (!hero) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 860px)').matches || window.matchMedia('(pointer: coarse)').matches;
  const lite = reduce || isMobile;

  // 触发揭示：磨砂层散去，背景由模糊转明亮
  if (reduce) {
    hero.classList.add('revealed');
  } else {
    requestAnimationFrame(() => setTimeout(() => hero.classList.add('revealed'), 250));
  }

  // 镜面高光已改为静态柔光（见 style.css），不再随指针扫动

  // 移动端 / 触屏：切到轻量视觉，关闭视频与水波，避免卡顿与流量消耗。
  // 注意：减弱动效（reduced-motion）不再隐藏视频背景，仅关闭水波模拟，
  // 以保证视频在各类预览 / 受限渲染环境中也能正常呈现。
  if (isMobile) {
    hero.classList.add('lite');
    const v = document.querySelector('.hero-video');
    if (v) { try { v.pause(); } catch (e) {} v.style.display = 'none'; }
  }

  // 仅移动端 / 触屏跳过水波模拟（性能）；减弱动效（桌面）保留水波，因其为轻柔背景
  if (isMobile) return; // 移动端：不跑水波模拟

  // ---- 真实水面：在视频之上折射一层液态光面 ----
  const canvas = document.getElementById('waterCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLS = 220;        // 模拟列数（性能/细腻度平衡点）
  const DAMP = 0.985;      // 阻尼，越小水越“黏”停得越快
  const OFF = 1.2;         // 折射位移强度（轻柔）
  const SHADE = 0.85;      // 波峰波谷明暗强度（轻柔）

  let simW, simH, scale, n;
  let cur, prev, srcData, out, outCtx, outImg, outData;

  // 运行控制：平静后自动停止 rAF，避免无谓空转；标签页隐藏时也暂停
  let running = false;
  let rafId = null;
  let lastDrop = performance.now();
  function ensureRunning() {
    if (!running) {
      running = true;
      rafId = requestAnimationFrame(step);
    }
  }

  function buildSource() {
    srcData = new Uint8ClampedArray(n * 4);
    for (let y = 0; y < simH; y++) {
      for (let x = 0; x < simW; x++) {
        const i = (y * simW + x) * 4;
        // 平静的淡色水膜（基底几乎不变，仅涟漪折射时动）
        let r = 14, g = 46, b = 84, a = 0.15 * 255;
        // 极淡焦散，仅作水色层次，不抢眼
        const v = Math.sin(x * 0.05 + Math.sin(y * 0.08) * 2) * Math.cos(y * 0.06 - x * 0.02);
        const c = v > 0 ? v : 0;
        r += c * 34; g += c * 44; b += c * 44; a += c * 20;
        srcData[i] = r; srcData[i + 1] = g; srcData[i + 2] = b;
        srcData[i + 3] = a > 255 ? 255 : a;
      }
    }
  }

  function build() {
    const rect = hero.getBoundingClientRect();
    const cw = Math.max(1, Math.round(rect.width));
    const ch = Math.max(1, Math.round(rect.height));
    canvas.width = cw;
    canvas.height = ch;

    simW = COLS;
    simH = Math.max(2, Math.round(COLS * ch / cw));
    scale = cw / simW;
    n = simW * simH;
    cur = new Float32Array(n);
    prev = new Float32Array(n);
    buildSource();

    out = document.createElement('canvas');
    out.width = simW; out.height = simH;
    outCtx = out.getContext('2d');
    outImg = outCtx.createImageData(simW, simH);
    outData = outImg.data;
  }

  // 在 hero 像素坐标 (px,py) 处投下一滴水
  function drop(px, py, radius, strength) {
    const cx = Math.round(px / scale);
    const cy = Math.round(py / scale);
    const r2 = radius * radius;
    for (let j = -radius; j <= radius; j++) {
      for (let i = -radius; i <= radius; i++) {
        const xx = cx + i, yy = cy + j;
        if (xx < 1 || yy < 1 || xx >= simW - 1 || yy >= simH - 1) continue;
        if (i * i + j * j > r2) continue;
        prev[xx + yy * simW] += strength;
      }
    }
    lastDrop = performance.now();
    ensureRunning();
  }

  function step() {
    // 物理：波动方程（交换缓冲）
    for (let y = 1; y < simH - 1; y++) {
      const row = y * simW;
      for (let x = 1; x < simW - 1; x++) {
        const i = row + x;
        let v = (prev[i - 1] + prev[i + 1] + prev[i - simW] + prev[i + simW]) * 0.5 - cur[i];
        cur[i] = v * DAMP;
      }
    }
    const tmp = prev; prev = cur; cur = tmp;

    // 渲染：用高度梯度折射采样液态光面 + 波峰波谷明暗
    let energy = 0;
    for (let y = 1; y < simH - 1; y++) {
      const row = y * simW;
      for (let x = 1; x < simW - 1; x++) {
        const i = row + x;
        const dx = prev[i - 1] - prev[i + 1];
        const dy = prev[i - simW] - prev[i + simW];
        let sx = x + (dx * OFF) | 0;
        let sy = y + (dy * OFF) | 0;
        if (sx < 0) sx = 0; else if (sx >= simW) sx = simW - 1;
        if (sy < 0) sy = 0; else if (sy >= simH) sy = simH - 1;
        const si = (sy * simW + sx) * 4;
        const di = i * 4;
        const sh = (dx + dy) * SHADE;
        outData[di] = clamp(srcData[si] + sh);
        outData[di + 1] = clamp(srcData[si + 1] + sh);
        outData[di + 2] = clamp(srcData[si + 2] + sh);
        outData[di + 3] = srcData[si + 3];
        energy += Math.abs(prev[i]);
      }
    }
    outCtx.putImageData(outImg, 0, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(out, 0, 0, canvas.width, canvas.height);

    // 平静且距上次投石已有一段时间 → 停止循环，节省资源
    if (energy < 0.6 && performance.now() - lastDrop > 1200) {
      running = false;
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(step);
  }
  const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

  build();
  ensureRunning();

  // 视图尺寸变化重建
  if (window.ResizeObserver) {
    new ResizeObserver(() => build()).observe(hero);
  } else {
    window.addEventListener('resize', build);
  }

  // 点击/触摸：像在水面轻掷一颗小石子，激起轻柔微波荡漾
  hero.addEventListener('pointerdown', (e) => {
    const r = hero.getBoundingClientRect();
    drop(e.clientX - r.left, e.clientY - r.top, 3, 150);
  });

  // 载入后中心轻轻荡开几圈，约 4 秒的微波开场（不再随鼠标移动出水波）
  const r0 = hero.getBoundingClientRect();
  setTimeout(() => drop(r0.width / 2, r0.height / 2, 3, 150), 500);
  setTimeout(() => drop(r0.width * 0.5, r0.height * 0.42, 3, 120), 1500);
  setTimeout(() => drop(r0.width * 0.5, r0.height * 0.58, 3, 120), 2600);
  setTimeout(() => drop(r0.width * 0.5, r0.height * 0.50, 2, 100), 3700);

  // 标签页隐藏时暂停模拟，回到前台再恢复
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      running = false;
    } else {
      ensureRunning();
    }
  });
})();

/* ---------- 8. 移动端导航开关 ---------- */
(function () {
  const nav = document.querySelector('.nav');
  const toggle = document.getElementById('navToggle');
  if (!nav || !toggle) return;
  function setOpen(open) {
    nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  }
  toggle.addEventListener('click', () => {
    setOpen(!nav.classList.contains('menu-open'));
  });
  nav.querySelectorAll('.nav-links a').forEach((a) => {
    a.addEventListener('click', () => setOpen(false));
  });
})();
