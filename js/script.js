/* =========================================================
  script.js — включает:
  - темы (data-theme)
  - меню (doors) + ESC + клики
  - split chars + hero animation (GSAP)
  - playbill thumbs slider
  - audio vinyl player + viz + carousel + controls
  - video player (добавляет <video> в .videoplayer__screen) + viz + carousel + controls
  - язык (ru/en) для заголовков/hints/названий треков
========================================================= */

(function(){
  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  function test(){
    console.assert($('#menu'), 'menu exists');
    console.assert($('#menuBtn'), 'menuBtn exists');
    console.assert($('#heroTitle'), 'heroTitle exists');
    console.assert($('#bookBtn'), 'bookBtn exists');
    console.assert($('#bookingModal'), 'bookingModal exists');
    console.assert($('#closeBooking'), 'closeBooking exists');
    console.assert($('#cursor'), 'cursor exists');

    console.assert($('[data-playbill-std]'), 'playbillStd exists');
    console.assert($('[data-vplayer]'), 'vplayer exists');
    console.assert($('[data-videoplayer]'), 'videoplayer exists');
  }

  function splitToChars(el){
    const raw = (el.textContent || '').trim();
    if(!raw) return;
    el.textContent = '';
    for (const ch of raw){
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = (ch === ' ') ? '\u00A0' : ch;
      el.appendChild(span);
    }
  }

  function animateHeroTitle(){
    const chars = document.querySelectorAll('#heroTitle .char');
    if(!chars.length || !window.gsap) return;

    gsap.killTweensOf(chars);
    gsap.set(chars,{y:120,opacity:0,rotation:12,transformOrigin:'50% 100%'});
    return gsap.timeline()
      .to(chars,{y:0,rotation:0,opacity:1,duration:1.05,ease:'power4.out',stagger:{each:0.05,from:'center'}})
      .to(chars,{y:-18,duration:0.55,ease:'sine.inOut',stagger:{each:0.05,from:'center'}},'-=0.70');
  }

  function initThemes(){
    const html = document.documentElement;
    $all('.theme-dot').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        html.setAttribute('data-theme', btn.dataset.theme);
        // refresh visualizer palettes
        if (window.__vpReadVizVars) window.__vpReadVizVars();
        if (window.__vdpReadVizVars) window.__vdpReadVizVars();
      });
    });
  }

  function initMenu(){
    const menu = $('#menu');
    const menuBtn = $('#menuBtn');
    const left = $('#doorLeft');
    const right = $('#doorRight');
    if(!menu || !menuBtn || !left || !right || !window.gsap) return;

    let menuOpen = false;

    const tlMenu = gsap.timeline({paused:true})
      .set(menu,{autoAlpha:1})
      .fromTo(left,{xPercent:-100},{xPercent:0,duration:0.90,ease:'power4.out'},0)
      .fromTo(right,{xPercent:100},{xPercent:0,duration:0.90,ease:'power4.out'},0)
      .from('.menu__item',{y:-36,opacity:0,stagger:0.08,duration:0.55},0.50)
      .from('.menu__bottom',{opacity:0,y:10,duration:0.35},0.85);

    tlMenu.eventCallback('onReverseComplete', ()=>{ gsap.set(menu,{autoAlpha:0}); });

    function openMenu(){
      if(menuOpen) return;
      tlMenu.play(0);
      menu.classList.add('is-open');
      menuBtn.setAttribute('aria-expanded','true');
      menu.setAttribute('aria-hidden','false');
      menuOpen = true;
    }
    function closeMenu(){
      if(!menuOpen) return;
      tlMenu.reverse();
      menu.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded','false');
      menu.setAttribute('aria-hidden','true');
      menuOpen = false;
    }
    function toggleMenu(){ menuOpen ? closeMenu() : openMenu(); }

    menuBtn.addEventListener('click', toggleMenu);
    menu.addEventListener('click', (e)=>{ if(!e.target.closest('.menu__panel')) closeMenu(); });
    $all('#menu a').forEach(a=>a.addEventListener('click', closeMenu));
    window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMenu(); });

    // expose if needed
    window.__closeMenu = closeMenu;
  }

  function initBookingModal(){
    const modal = $('#bookingModal');
    const overlay = modal ? modal.querySelector('[data-booking-close]') : null;
    const openBtn = $('#bookBtn');
    const closeBtn = $('#closeBooking');

    if(!modal || !overlay || !openBtn || !closeBtn) return;

    function open(){
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden','false');
    }
    function close(){
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden','true');
    }

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
  }

  function initCursor(){
    const cursor = $('#cursor');
    const finePointer = !(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    if(!cursor || !finePointer) return;

    let mx=0,my=0,x=0,y=0;
    let rot=0;
    let active=false;

    window.addEventListener('pointermove',(e)=>{mx=e.clientX;my=e.clientY;},{passive:true});

    function isClickable(el){
      return !!el.closest('a,button,[role="button"],.btn,.playbillStd__thumb,.vbtn,.vplayer__trackCard,.videoplayer__trackCard');
    }

    document.addEventListener('pointerover',(e)=>{
      if(isClickable(e.target)){
        active=true;
        cursor.classList.add('is-active');
      }
    },{passive:true});

    document.addEventListener('pointerout',(e)=>{
      if(isClickable(e.target)){
        active=false;
        cursor.classList.remove('is-active');
      }
    },{passive:true});

    (function loop(){
      x += (mx - x) * 0.18;
      y += (my - y) * 0.18;
      if(active) rot += 0.8;
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
      cursor.style.setProperty('--rot', rot + 'deg');
      requestAnimationFrame(loop);
    })();
  }

  function initPlaybill(){
    const pb = $('[data-playbill-std]');
    if(!pb) return;

    const slides = $all('[data-slide]', pb);
    const thumbs = $all('[data-idx]', pb);
    const mainImg = $('#playbillStdMainImg', pb);

    let idx = slides.findIndex(s => s.classList.contains('is-active'));
    if(idx < 0) idx = 0;

    function syncThumbs(){
      thumbs.forEach(t => t.setAttribute('aria-current', String(Number(t.dataset.idx) === idx)));
    }
    function syncMainImage(){
      const src = slides[idx]?.dataset?.img;
      if(mainImg && src) mainImg.src = src;
    }
    function show(i){
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, n)=>s.classList.toggle('is-active', n === idx));
      syncThumbs();
      syncMainImage();
    }

    pb.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-idx]');
      if(!btn) return;
      const to = Number(btn.dataset.idx);
      if(Number.isFinite(to)) show(to);
    });

    pb.addEventListener('keydown', (e)=>{
      if(e.key === 'ArrowLeft') show(idx - 1);
      if(e.key === 'ArrowRight') show(idx + 1);
    });

    show(idx);
  }

  /* ================= LANGUAGE ================= */
  const I18N = {
    ru: {
      audioTitle: 'Аудио',
      audioHint: 'Play — визуализация · Игла опускается справа · Выбор трека — карточки снизу',
      videoTitle: 'Видео',
      videoHint: 'Play — запуск видео · Выбор ролика — карточки снизу',
      coverAlt: 'Обложка трека',
      posterAlt: 'Постер видео',
      tracksAudio: ['Произведение 1','Произведение 2','Произведение 3'],
      tracksVideo: ['Видео 1','Видео 2','Видео 3'],
      badge: 'PREVIEW'
    },
    en: {
      audioTitle: 'Audio',
      audioHint: 'Play — visualization · Needle drops from the right · Choose track below',
      videoTitle: 'Video',
      videoHint: 'Play — start video · Choose clip below',
      coverAlt: 'Track cover',
      posterAlt: 'Video poster',
      tracksAudio: ['Piece 1','Piece 2','Piece 3'],
      tracksVideo: ['Video 1','Video 2','Video 3'],
      badge: 'PREVIEW'
    }
  };

  function initLang(){
    const root = document.documentElement;
    $all('[data-lang]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        root.setAttribute('data-lang', btn.dataset.lang);
        if (window.__vpSetLang) window.__vpSetLang(btn.dataset.lang);
        if (window.__vdpSetLang) window.__vdpSetLang(btn.dataset.lang);
      });
    });
  }

  /* ================= AUDIO PLAYER ================= */
  function initAudioPlayer(){
    const wrap = $('[data-vplayer]');
    if(!wrap) return;

    const root = document.documentElement;
    let lang = root.getAttribute('data-lang') || 'ru';

    // !!! ВАЖНО: поменяй пути на реальные файлы
    const playlist = [
      { src: '/audio/1.mp3', cover: '/audio/front.png' },
      { src: '/audio/2.mp3', cover: '/audio/front.png' },
      { src: '/audio/3.mp3', cover: '/audio/front.png' }
    ];
    let index = 0;

    const audio = $('#vpAudio');
    const plate = $('#vpPlate');
    const needle = $('#vpNeedle');
    const coverImg = $('#vpCoverImg');
    const canvas = $('#vpViz');
    const ctx = canvas?.getContext('2d');
    const carousel = $('#vpCarousel');

    const prevTrackBtn = $('#vpPrevTrackBtn');
    const nextTrackBtn = $('#vpNextTrackBtn');
    const playBtn = $('#vpPlayBtn');
    const pauseBtn = $('#vpPauseBtn');
    const stopBtn = $('#vpStopBtn');
    const prevCarouselBtn = $('#vpPrevCarouselBtn');
    const nextCarouselBtn = $('#vpNextCarouselBtn');
    const hintEl = $('#vpHint');

    if(!audio || !plate || !needle || !coverImg || !canvas || !ctx || !carousel) return;

    /* palette from CSS vars */
    let VIZ = null;
    function readVizVars(){
      const cs = getComputedStyle(wrap);
      VIZ = {
        bg1: cs.getPropertyValue('--vp-viz-bg1').trim(),
        bg2: cs.getPropertyValue('--vp-viz-bg2').trim(),
        glow: cs.getPropertyValue('--vp-viz-glow').trim(),
        shape: cs.getPropertyValue('--vp-viz-shape').trim(),
        text: cs.getPropertyValue('--vp-viz-text').trim(),
        barsBg: cs.getPropertyValue('--vp-bars-bg').trim(),
        bars1: cs.getPropertyValue('--vp-bars-1').trim(),
        bars2: cs.getPropertyValue('--vp-bars-2').trim(),
      };
    }
    readVizVars();
    window.__vpReadVizVars = readVizVars;

    let audioCtx, analyser, data;
    function initAudioCtx(){
      if (audioCtx) return;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;
      data = new Uint8Array(analyser.frequencyBinCount);
      const src = audioCtx.createMediaElementSource(audio);
      src.connect(analyser);
      analyser.connect(audioCtx.destination);
    }

    function resize(){
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(2, Math.floor(w * dpr));
      canvas.height = Math.max(2, Math.floor(h * dpr));
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    window.addEventListener('resize', resize);
    resize();

    function drawIdle(){
      if(!VIZ) readVizVars();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0,0,w,h);

      const bg = ctx.createLinearGradient(0,0,0,h);
      bg.addColorStop(0, VIZ.bg1);
      bg.addColorStop(1, VIZ.bg2);
      ctx.fillStyle = bg;
      ctx.fillRect(0,0,w,h);

      const glow = ctx.createRadialGradient(w*0.5,h*0.6,0,w*0.5,h*0.6,Math.max(w,h)*0.55);
      glow.addColorStop(0, VIZ.glow);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0,0,w,h);

      ctx.fillStyle = VIZ.shape;
      ctx.fillRect(w*0.14,h*0.7,w*0.72,h*0.12);
      ctx.fillRect(w*0.18,h*0.46,w*0.64,h*0.26);

      ctx.beginPath();
      ctx.moveTo(w*0.12,h*0.46);
      ctx.lineTo(w*0.5,h*0.26);
      ctx.lineTo(w*0.88,h*0.46);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = VIZ.text;
      ctx.font = `800 ${Math.floor(Math.min(w,h)*0.07)}px system-ui`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(lang === 'ru' ? 'ТЕАТР' : 'THEATRE', w*0.5, h*0.16);
    }

    function drawBars(){
      if(!VIZ) readVizVars();
      analyser.getByteFrequencyData(data);
      const w=canvas.clientWidth, h=canvas.clientHeight;
      ctx.fillStyle = VIZ.barsBg;
      ctx.fillRect(0,0,w,h);

      const bars=64, bw=w/bars;
      for(let i=0;i<bars;i++){
        const v=data[i]/255;
        const bh=Math.max(2,v*h*0.9);
        const x=i*bw, y=h-bh;
        const g=ctx.createLinearGradient(0,y,0,y+bh);
        g.addColorStop(0, VIZ.bars1);
        g.addColorStop(1, VIZ.bars2);
        ctx.fillStyle=g;
        ctx.fillRect(x,y,Math.max(1,bw-2),bh);
      }
    }

    let __raf = 0;
    let __destroyed = false;
    (function loop(){
      if(__destroyed) return;
      __raf = requestAnimationFrame(loop);
      resize();
      if (!analyser || audio.paused) drawIdle(); else drawBars();
    })();

    wrap.__vpDestroy = function(){
      __destroyed = true;
      if(__raf) cancelAnimationFrame(__raf);
      window.removeEventListener('resize', resize);
      try{ audio.pause(); }catch(e){}
      try{ audio.removeAttribute('src'); audio.load(); }catch(e){}
      try{ if(audioCtx && audioCtx.state !== 'closed') audioCtx.close(); }catch(e){}
    };

    let carouselOffset=0;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

    function buildCarousel(){
      carousel.innerHTML='';
      const titles = I18N[lang]?.tracksAudio || [];
      playlist.forEach((t,i)=>{
        const card=document.createElement('div');
        card.className='vplayer__trackCard'+(i===index?' is-active':'');
        card.innerHTML=`<img src="${t.cover}" alt=""><div class="vplayer__trackTitle">${titles[i] || `Track ${i+1}`}</div>`;
        card.onclick=()=>loadTrack(i,true);
        carousel.appendChild(card);
      });
    }

    function updateCarousel(){
      [...carousel.children].forEach((c,i)=>c.classList.toggle('is-active',i===index));
    }

    function scrollCarousel(dir){
      const first=carousel.children[0]; if(!first)return;
      const step=first.getBoundingClientRect().width+18;
      const viewport=carousel.parentElement.getBoundingClientRect().width;
      const content=carousel.getBoundingClientRect().width;
      const max=Math.max(0,content-viewport);
      carouselOffset=clamp(carouselOffset+dir*step,0,max);
      carousel.style.transform=`translateX(${-carouselOffset}px)`;
    }

    prevCarouselBtn && (prevCarouselBtn.onclick=()=>scrollCarousel(-1));
    nextCarouselBtn && (nextCarouselBtn.onclick=()=>scrollCarousel(1));

    function applyPlayingUI(p){
      plate.classList.toggle('is-playing',p);
      needle.classList.toggle('is-playing',p);
    }

    function loadTrack(i,play=false){
      index=i;
      audio.src=playlist[i].src;
      coverImg.src=playlist[i].cover;
      coverImg.alt = I18N[lang]?.coverAlt || 'Cover';
      updateCarousel();

      if(play){
        initAudioCtx();
        audio.play().then(()=>applyPlayingUI(true)).catch(()=>{});
      }
    }

    playBtn && (playBtn.onclick=()=>{
      initAudioCtx();
      audio.play().then(()=>applyPlayingUI(true)).catch(()=>{});
    });
    pauseBtn && (pauseBtn.onclick=()=>{audio.pause();applyPlayingUI(false);});
    stopBtn && (stopBtn.onclick=()=>{audio.pause();audio.currentTime=0;applyPlayingUI(false);});
    nextTrackBtn && (nextTrackBtn.onclick=()=>loadTrack((index+1)%playlist.length,true));
    prevTrackBtn && (prevTrackBtn.onclick=()=>loadTrack((index-1+playlist.length)%playlist.length,true));

    audio.addEventListener('play',()=>{
      if(audioCtx && audioCtx.state==='suspended') audioCtx.resume();
      applyPlayingUI(true);
    });
    audio.addEventListener('pause',()=>applyPlayingUI(false));
    audio.addEventListener('ended',()=>applyPlayingUI(false));

    function setLang(next){
      lang = next;
      root.setAttribute('data-lang', lang);
      document.querySelectorAll('[data-i18n="audioTitle"]').forEach(el=>el.textContent = I18N[lang].audioTitle);
      if(hintEl) hintEl.textContent = I18N[lang].audioHint;
      buildCarousel();
      updateCarousel();
    }
    window.__vpSetLang = setLang;

    // init
    setLang(lang);
    buildCarousel();
    loadTrack(0,false);
  }

  /* ================= VIDEO PLAYER ================= */
  function initVideoPlayer(){
    const wrap = $('[data-videoplayer]');
    if(!wrap) return;

    const root = document.documentElement;
    let lang = root.getAttribute('data-lang') || 'ru';

    // !!! ВАЖНО: поменяй пути на реальные файлы
    const playlist = [
      { src: '/video/1.avi', poster: '/video/poster-1.png' },
      { src: '/video/2.mp4', poster: '/video/poster-2.png' },
      { src: '/video/3.mp4', poster: '/video/poster-3.png' }
    ];
    let index = 0;

    const screen = $('.videoplayer__screen', wrap);
    const posterImg = $('#vpVideoPoster');
    const badge = $('#vpVideoBadge');
    const canvas = $('#vpVideoViz');
    const ctx = canvas?.getContext('2d');
    const carousel = $('#carousel') || $('#vpVideoCarousel');

    const prevBtn = $('#vpVideoPrevBtn');
    const nextBtn = $('#vpVideoNextBtn');
    const playBtn = $('#vpVideoPlayBtn');
    const pauseBtn = $('#vpVideoPauseBtn');
    const stopBtn = $('#vpVideoStopBtn');
    const prevCarouselBtn = $('#prevCarousel') || $('#vpVideoPrevCarouselBtn');
    const nextCarouselBtn = $('#nextCarousel') || $('#vpVideoNextCarouselBtn');
    const hintEl = $('#vpVideoHint');

    if(!screen || !posterImg || !badge || !canvas || !ctx || !carousel) return;

    // video: используем существующий элемент #vpVideoEl (у тебя он уже в HTML)
    const videoEl = $('#vpVideoEl');
    if(!videoEl) return;
/* palette from CSS vars */
    let VIZ = null;
    function readVizVars(){
      const cs = getComputedStyle(wrap);
      VIZ = {
        bg1: cs.getPropertyValue('--vdp-viz-bg1').trim(),
        bg2: cs.getPropertyValue('--vdp-viz-bg2').trim(),
        glow: cs.getPropertyValue('--vdp-glow').trim(),
        barsBg: cs.getPropertyValue('--vdp-bars-bg').trim(),
        bars1: cs.getPropertyValue('--vdp-bars-1').trim(),
        bars2: cs.getPropertyValue('--vdp-bars-2').trim(),
      };
    }
    readVizVars();
    window.__vdpReadVizVars = readVizVars;

    let videoCtx, analyser, data;
    function initVideoCtx(){
      if(videoCtx) return;
      videoCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = videoCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;
      data = new Uint8Array(analyser.frequencyBinCount);

      const src = videoCtx.createMediaElementSource(videoEl);
      src.connect(analyser);
      analyser.connect(videoCtx.destination);
    }

    function resize(){
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(2, Math.floor(w * dpr));
      canvas.height = Math.max(2, Math.floor(h * dpr));
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    window.addEventListener('resize', resize);
    resize();

    function drawIdle(){
      if(!VIZ) readVizVars();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0,0,w,h);

      const bg = ctx.createLinearGradient(0,0,0,h);
      bg.addColorStop(0, VIZ.bg1);
      bg.addColorStop(1, VIZ.bg2);
      ctx.fillStyle = bg;
      ctx.fillRect(0,0,w,h);

      const glow = ctx.createRadialGradient(w*0.55,h*0.45,0,w*0.55,h*0.45,Math.max(w,h)*0.60);
      glow.addColorStop(0, VIZ.glow);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0,0,w,h);

      ctx.fillStyle = 'rgba(255,255,255,.10)';
      const pad = Math.min(w,h)*0.12;
      ctx.fillRect(pad, h*0.62, w-pad*2, h*0.10);
      ctx.fillRect(pad*1.2, h*0.40, w-pad*2.4, h*0.16);

      ctx.fillStyle = 'rgba(255,255,255,.18)';
      ctx.font = `800 ${Math.floor(Math.min(w,h)*0.07)}px system-ui`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(lang === 'ru' ? 'ВИДЕО' : 'VIDEO', w*0.5, h*0.18);
    }

    function drawBars(){
      if(!VIZ) readVizVars();
      analyser.getByteFrequencyData(data);

      const w=canvas.clientWidth, h=canvas.clientHeight;
      ctx.fillStyle = VIZ.barsBg;
      ctx.fillRect(0,0,w,h);

      const bars=64, bw=w/bars;
      for(let i=0;i<bars;i++){
        const v=data[i]/255;
        const bh=Math.max(2,v*h*0.9);
        const x=i*bw, y=h-bh;
        const g=ctx.createLinearGradient(0,y,0,y+bh);
        g.addColorStop(0, VIZ.bars1);
        g.addColorStop(1, VIZ.bars2);
        ctx.fillStyle=g;
        ctx.fillRect(x,y,Math.max(1,bw-2),bh);
      }
    }

    let __raf = 0;
    let __destroyed = false;
    (function loop(){
      if(__destroyed) return;
      __raf = requestAnimationFrame(loop);
      resize();
      if (!analyser || videoEl.paused) drawIdle(); else drawBars();
    })();

    wrap.__vdpDestroy = function(){
      __destroyed = true;
      if(__raf) cancelAnimationFrame(__raf);
      window.removeEventListener('resize', resize);
      try{ videoEl.pause(); }catch(e){}
      try{ videoEl.removeAttribute('src'); videoEl.load(); }catch(e){}
      try{ if(audioCtx && audioCtx.state !== 'closed') audioCtx.close(); }catch(e){}
    };

    function setPlayingUI(isPlaying){
      screen.classList.toggle('is-playing', isPlaying);
    }

    let carouselOffset=0;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

    function buildCarousel(){
      carousel.innerHTML='';
      const titles = I18N[lang]?.tracksVideo || [];
      playlist.forEach((t,i)=>{
        const card = document.createElement('div');
        card.className = 'videoplayer__trackCard' + (i===index ? ' is-active' : '');
        card.innerHTML = `<img src="${t.poster}" alt=""><div class="videoplayer__trackTitle">${titles[i] || `Video ${i+1}`}</div>`;
        card.onclick = ()=>loadVideo(i, true);
        carousel.appendChild(card);
      });
    }

    function updateCarousel(){
      [...carousel.children].forEach((c,i)=>c.classList.toggle('is-active', i===index));
    }

    function scrollCarousel(dir){
      const first=carousel.children[0]; if(!first)return;
      const step=first.getBoundingClientRect().width+18;
      const viewport=carousel.parentElement.getBoundingClientRect().width;
      const content=carousel.getBoundingClientRect().width;
      const max=Math.max(0,content-viewport);
      carouselOffset=clamp(carouselOffset+dir*step,0,max);
      carousel.style.transform=`translateX(${-carouselOffset}px)`;
    }

    prevCarouselBtn && (prevCarouselBtn.onclick=()=>scrollCarousel(-1));
    nextCarouselBtn && (nextCarouselBtn.onclick=()=>scrollCarousel(1));

    function loadVideo(i, play=false){
      index=i;

      const item = playlist[i];
      posterImg.src = item.poster;
      posterImg.alt = I18N[lang]?.posterAlt || 'Poster';
      badge.textContent = I18N[lang]?.badge || 'PREVIEW';

      videoEl.src = item.src;
      videoEl.load();

      updateCarousel();
      setPlayingUI(false);

      if(play){
        initVideoCtx();
        videoEl.play().then(()=>{
          setPlayingUI(true);
        }).catch(()=>{});
      }
    }

    playBtn && (playBtn.onclick=()=>{
      initVideoCtx();
      videoEl.play().then(()=>setPlayingUI(true)).catch(()=>{});
    });
    pauseBtn && (pauseBtn.onclick=()=>{ videoEl.pause(); setPlayingUI(false); });
    stopBtn && (stopBtn.onclick=()=>{ videoEl.pause(); videoEl.currentTime=0; setPlayingUI(false); });

    nextBtn && (nextBtn.onclick=()=>loadVideo((index+1)%playlist.length,true));
    prevBtn && (prevBtn.onclick=()=>loadVideo((index-1+playlist.length)%playlist.length,true));

    videoEl.addEventListener('play', ()=>{
      if(videoCtx && videoCtx.state==='suspended') videoCtx.resume();
      setPlayingUI(true);
    });
    videoEl.addEventListener('pause', ()=>setPlayingUI(false));
    videoEl.addEventListener('ended', ()=>setPlayingUI(false));

    function setLang(next){
      lang = next;
      root.setAttribute('data-lang', lang);

      document.querySelectorAll('[data-i18n="videoTitle"]').forEach(el=>el.textContent = I18N[lang].videoTitle);
      if(hintEl) hintEl.textContent = I18N[lang].videoHint;
      if(badge) badge.textContent = I18N[lang].badge;

      buildCarousel();
      updateCarousel();

      // обновим текущий постер/alt
      if(playlist[index]) {
        posterImg.alt = I18N[lang]?.posterAlt || 'Poster';
      }
    }
    window.__vdpSetLang = setLang;

    // init
    setLang(lang);
    buildCarousel();
    loadVideo(0,false);
  }

  /* ================= BARBA (не обязательно, но оставляем) ================= */
  

  /* ================= SMOOTH SCROLL (LENIS) ================= */
  window.__lenis = window.__lenis || null;
  function initSmoothScroll(){
    if(!window.Lenis) return;
    if(window.__lenis) return;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1
    });
    window.__lenis = lenis;

    function raf(time){
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if(window.gsap && window.ScrollTrigger){
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t)=>lenis.raf(t*1000));
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.refresh();
    }
  }

  /* ================= HERO PARALLAX (ScrollTrigger) ================= */
  function initHeroParallax(container=document){
    if(!window.gsap || !window.ScrollTrigger) return;
    const hero = container.querySelector('.hero');
    if(!hero) return;
    const bg = hero.querySelector('.hero__bg');
    if(!bg) return;

    gsap.to(bg, {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2
      }
    });
  }


  function initBarba(){
    if(!window.barba || !window.gsap) return;

    const overlay = document.querySelector('.page-transition');

    function showOverlay(){
      if(!overlay) return gsap.timeline();
      return gsap.timeline()
        .set(overlay,{autoAlpha:1})
        .fromTo(overlay,{scaleY:0,transformOrigin:'50% 0%'},{scaleY:1,duration:0.55,ease:'power3.inOut'});
    }

    function hideOverlay(){
      if(!overlay) return gsap.timeline();
      return gsap.timeline()
        .fromTo(overlay,{scaleY:1,transformOrigin:'50% 100%'},{scaleY:0,duration:0.55,ease:'power3.inOut'})
        .set(overlay,{autoAlpha:0});
    }

    function destroyIn(container){
      const vp = container.querySelector('[data-vplayer]');
      if(vp && vp.__vpDestroy) vp.__vpDestroy();

      const vdp = container.querySelector('[data-videoplayer]');
      if(vdp && vdp.__vdpDestroy) vdp.__vdpDestroy();

      if(window.ScrollTrigger) ScrollTrigger.getAll().forEach(t=>t.kill());
    }

    function initIn(container){
      safeHeroInit();
      initPlaybill();
      initAudioPlayer();
      initVideoPlayer();
      initHeroParallax(container);
      if(window.ScrollTrigger) ScrollTrigger.refresh();
    }

    barba.init({
      transitions: [{
        async leave(data){
          destroyIn(data.current.container);
          await showOverlay();
        },
        async enter(data){
          initIn(data.next.container);
          await hideOverlay();
          if(window.__lenis) window.__lenis.scrollTo(0, {immediate:true});
          else window.scrollTo(0,0);
        },
        async once(data){
          initIn(data.next.container);
          if(overlay) gsap.set(overlay,{autoAlpha:0,scaleY:0});
        }
      }]
    });
  }

  function safeHeroInit(){
    const heroTitle = $('#heroTitle');
    if(heroTitle && heroTitle.dataset.split === 'chars' && !heroTitle.querySelector('.char')){
      splitToChars(heroTitle);
    }
    animateHeroTitle();
  }

  function initAll(){
    test();

    initThemes();

    initSmoothScroll();
    initMenu();
    initBookingModal();
    initCursor();
    initPlaybill();
    initLang();

    safeHeroInit();

    initHeroParallax(document);

    initAudioPlayer();
    initVideoPlayer();

    initBarba();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAll, {once:true});
  } else {
    initAll();
  }
})();
