/* =========================
   Clean VIP template app.js
   GSAP doors menu + theme + Swiper
   Audio player with WebAudio visualizer
   Video list + basic form stub
   ========================= */

   (() => {
    const qs = (s, r = document) => r.querySelector(s);
    const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  
    /* ---------- Year ---------- */
    const y = qs("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  
    /* ---------- Theme ---------- */
    const root = document.documentElement;
    const themeToggle = qs("#themeToggle");
    const themeBadge = qs("#themeBadge");
  
    const applyTheme = (t) => {
      root.setAttribute("data-theme", t);
      if (themeBadge) themeBadge.textContent = t === "dark" ? "Dark" : "Light";
      localStorage.setItem("theme", t);
    };
  
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") applyTheme(savedTheme);
  
    themeToggle?.addEventListener("click", () => {
      const cur = root.getAttribute("data-theme") || "dark";
      applyTheme(cur === "dark" ? "light" : "dark");
    });
  
    /* ---------- Menu doors (GSAP) ---------- */
    const burger = qs("#burger");
    const overlay = qs("#menuOverlay");
    const doorL = qs("#doorLeft");
    const doorR = qs("#doorRight");
    const menuPanel = qs(".menu-panel");
    const menuItems = qsa(".menu-link");
  
    let menuOpen = false;
  
    // initial hidden
    gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
    gsap.set(menuPanel, { autoAlpha: 0 });
    gsap.set(doorL, { xPercent: -100 });
    gsap.set(doorR, { xPercent: 100 });
    gsap.set(menuItems, { y: 18, autoAlpha: 0 });
  
    const tlOpen = gsap.timeline({ paused: true })
      .set(overlay, { autoAlpha: 1, pointerEvents: "auto" })
      .to([doorL, doorR], {
        duration: 0.9,
        xPercent: 0,
        ease: "power3.out",
        stagger: 0.03
      }, 0)
      .to(menuPanel, { duration: 0.35, autoAlpha: 1, ease: "power2.out" }, 0.35)
      // "по очереди" (каждый пункт отдельно)
      .to(menuItems, {
        duration: 0.55,
        y: 0,
        autoAlpha: 1,
        ease: "power3.out",
        stagger: 0.09
      }, 0.45);
  
    const tlClose = gsap.timeline({ paused: true })
      .to(menuItems, {
        duration: 0.25,
        y: 10,
        autoAlpha: 0,
        ease: "power2.in",
        stagger: 0.03,
        from: "end"
      }, 0)
      .to(menuPanel, { duration: 0.2, autoAlpha: 0 }, 0.05)
      .to([doorL, doorR], {
        duration: 0.75,
        ease: "power3.in",
        xPercent: (i) => (i === 0 ? -100 : 100)
      }, 0.12)
      .set(overlay, { autoAlpha: 0, pointerEvents: "none" });
  
    const openMenu = () => {
      if (menuOpen) return;
      menuOpen = true;
      burger?.setAttribute("aria-expanded", "true");
      tlClose.pause(0);
      tlOpen.play(0);
      document.body.style.overflow = "hidden";
    };
  
    const closeMenu = () => {
      if (!menuOpen) return;
      menuOpen = false;
      burger?.setAttribute("aria-expanded", "false");
      tlOpen.pause(0);
      tlClose.play(0);
      document.body.style.overflow = "";
    };
  
    burger?.addEventListener("click", () => {
      menuOpen ? closeMenu() : openMenu();
    });
  
    // close on overlay click (but not inside menu panel)
    overlay?.addEventListener("click", (e) => {
      if (e.target === overlay || e.target === doorL || e.target === doorR) closeMenu();
    });
  
    // close on ESC
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  
    // close menu when click link
    menuItems.forEach((a) => {
      a.addEventListener("click", () => closeMenu());
    });
  
    /* ---------- Swiper (news) ---------- */
    // Note: requires Swiper loaded (it is in HTML)
    const newsSwiperEl = qs("#newsSwiper");
    if (newsSwiperEl && window.Swiper) {
      new Swiper("#newsSwiper", {
        slidesPerView: 1,
        spaceBetween: 16,
        speed: 850,
        loop: true,
        pagination: {
          el: ".swiper-pagination",
          clickable: true
        },
        navigation: {
          nextEl: ".nav-btn--next",
          prevEl: ".nav-btn--prev"
        }
      });
    }
  
    /* ---------- Audio player + visualizer ---------- */
    const audioEl = qs("#audioEl");
    const viz = qs("#viz");
    const trackListEl = qs("#trackList");
  
    const btnPrev = qs("#btnPrev");
    const btnPlay = qs("#btnPlay");
    const btnStop = qs("#btnStop");
    const btnNext = qs("#btnNext");
    const seek = qs("#seek");
    const volume = qs("#volume");
    const curTime = qs("#curTime");
    const durTime = qs("#durTime");
    const trackTitle = qs("#trackTitle");
  
    // Replace with your actual audio paths
    const tracks = [
      { title: "День ли царит", artist: "Ксения Мусланова", src: "./audio/1.mp3" },
      { title: "Лишь ты один", artist: "Ксения Мусланова", src: "./audio/2.mp3" },
      { title: "То было раннею весной", artist: "Ксения Мусланова", src: "./audio/3.mp3" },
      { title: "Я ли в поле да не травушка была", artist: "Ксения Мусланова", src: "./audio/4.mp3" }
    ];
  
    let currentIndex = 0;
    let isSeeking = false;
  
    const fmtTime = (sec) => {
      if (!Number.isFinite(sec) || sec < 0) return "0:00";
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${String(s).padStart(2, "0")}`;
    };
  
    const renderTrackList = () => {
      if (!trackListEl) return;
      trackListEl.innerHTML = "";
      tracks.forEach((t, idx) => {
        const div = document.createElement("div");
        div.className = "track-item" + (idx === currentIndex ? " is-active" : "");
        div.innerHTML = `
          <div class="track-left">
            <div class="track-name">${t.title}</div>
            <div class="track-sub">${t.artist}</div>
          </div>
          <div class="track-dur" data-dur>--:--</div>
        `;
        div.addEventListener("click", () => loadTrack(idx, true));
        trackListEl.appendChild(div);
      });
    };
  
    const setPlayIcon = (playing) => {
      const i = btnPlay?.querySelector("i");
      if (!i) return;
      i.className = playing ? "fa-solid fa-pause" : "fa-solid fa-play";
    };
  
    const loadTrack = (idx, autoplay = false) => {
      currentIndex = (idx + tracks.length) % tracks.length;
      const t = tracks[currentIndex];
      if (trackTitle) trackTitle.textContent = t.title;
      if (audioEl) {
        audioEl.src = t.src;
        audioEl.load();
        if (autoplay) audioEl.play().catch(() => {});
      }
      renderTrackList();
    };
  
    // Audio setup
    let audioCtx = null;
    let analyser = null;
    let sourceNode = null;
    let dataArray = null;
    let rafId = 0;
  
    const ensureAudioGraph = () => {
      if (!audioEl) return false;
  
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        const bufferLen = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLen);
  
        sourceNode = audioCtx.createMediaElementSource(audioEl);
        sourceNode.connect(analyser);
        analyser.connect(audioCtx.destination);
      }
      return true;
    };
  
    const drawViz = () => {
      if (!viz || !analyser || !dataArray) return;
      const ctx = viz.getContext("2d");
      if (!ctx) return;
  
      const w = viz.width;
      const h = viz.height;
  
      analyser.getByteFrequencyData(dataArray);
  
      // background
      ctx.clearRect(0, 0, w, h);
  
      // bars
      const barCount = 64;
      const step = Math.floor(dataArray.length / barCount);
      const gap = 4;
      const barW = (w - gap * (barCount - 1)) / barCount;
  
      // Use current computed colors (no hardcoded palette)
      const style = getComputedStyle(document.documentElement);
      const gold2 = style.getPropertyValue("--gold-2").trim() || "#c7a03c";
      const gold3 = style.getPropertyValue("--gold-3").trim() || "#f9de90";
  
      // simple vertical gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, gold3);
      grad.addColorStop(1, gold2);
  
      ctx.fillStyle = grad;
  
      for (let i = 0; i < barCount; i++) {
        const v = dataArray[i * step] / 255; // 0..1
        const barH = Math.max(6, v * h);
        const x = i * (barW + gap);
        const y = h - barH;
  
        // rounded bars
        const r = 6;
        roundRect(ctx, x, y, barW, barH, r);
        ctx.fill();
      }
  
      rafId = requestAnimationFrame(drawViz);
    };
  
    function roundRect(ctx, x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }
  
    const startViz = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(drawViz);
    };
  
    const stopViz = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
      if (viz) {
        const ctx = viz.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, viz.width, viz.height);
      }
    };
  
    // Controls
    btnPlay?.addEventListener("click", async () => {
      if (!audioEl) return;
      ensureAudioGraph();
      if (audioCtx && audioCtx.state === "suspended") {
        try { await audioCtx.resume(); } catch {}
      }
  
      if (audioEl.paused) {
        audioEl.play().then(() => {
          setPlayIcon(true);
          startViz();
        }).catch(() => {});
      } else {
        audioEl.pause();
        setPlayIcon(false);
        // keep viz running or not — better stop
        stopViz();
      }
    });
  
    btnStop?.addEventListener("click", () => {
      if (!audioEl) return;
      audioEl.pause();
      audioEl.currentTime = 0;
      setPlayIcon(false);
      stopViz();
    });
  
    btnPrev?.addEventListener("click", () => loadTrack(currentIndex - 1, true));
    btnNext?.addEventListener("click", () => loadTrack(currentIndex + 1, true));
  
    volume?.addEventListener("input", () => {
      if (!audioEl) return;
      audioEl.volume = Number(volume.value);
    });
  
    seek?.addEventListener("input", () => {
      isSeeking = true;
    });
    seek?.addEventListener("change", () => {
      if (!audioEl || !Number.isFinite(audioEl.duration)) return;
      const p = Number(seek.value) / Number(seek.max); // 0..1
      audioEl.currentTime = p * audioEl.duration;
      isSeeking = false;
    });
  
    audioEl?.addEventListener("loadedmetadata", () => {
      if (durTime && audioEl) durTime.textContent = fmtTime(audioEl.duration);
    });
  
    audioEl?.addEventListener("timeupdate", () => {
      if (!audioEl) return;
      if (curTime) curTime.textContent = fmtTime(audioEl.currentTime);
  
      if (!isSeeking && Number.isFinite(audioEl.duration) && seek) {
        const p = audioEl.currentTime / audioEl.duration;
        seek.value = String(Math.round(p * Number(seek.max)));
      }
    });
  
    audioEl?.addEventListener("ended", () => {
      setPlayIcon(false);
      stopViz();
      loadTrack(currentIndex + 1, true);
    });
  
    // First load
    renderTrackList();
    loadTrack(0, false);
    if (audioEl && volume) audioEl.volume = Number(volume.value);
  
    /* ---------- Video list ---------- */
    const videoEl = qs("#videoEl");
    const videoList = qs("#videoList");
  
    const videos = [
      { title: "Видео 1", src: "./video/1.mp4", poster: "./img/video/poster.jpg" },
      { title: "Видео 2", src: "./video/2.mp4", poster: "./img/video/poster2.jpg" },
      { title: "Видео 3", src: "./video/3.mp4", poster: "./img/video/poster3.jpg" }
    ];
    let videoIndex = 0;
  
    const renderVideos = () => {
      if (!videoList) return;
      videoList.innerHTML = "";
      videos.forEach((v, idx) => {
        const el = document.createElement("div");
        el.className = "video-item" + (idx === videoIndex ? " is-active" : "");
        el.textContent = v.title;
        el.addEventListener("click", () => {
          videoIndex = idx;
          if (videoEl) {
            videoEl.pause();
            videoEl.setAttribute("poster", v.poster);
            videoEl.innerHTML = `<source src="${v.src}" type="video/mp4">`;
            videoEl.load();
            videoEl.play().catch(() => {});
          }
          renderVideos();
        });
        videoList.appendChild(el);
      });
    };
    renderVideos();
  
    /* ---------- Form stub ---------- */
    const form = qs("#contactForm");
    const hint = qs("#formHint");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      if (hint) hint.textContent = "Шаблон: отправка отключена. Подключи свой обработчик.";
    });
  
  })();
  