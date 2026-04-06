
(() => {
  // ====== Year
  const y = document.getElementById('yearNow');
  if (y) y.textContent = new Date().getFullYear();

  // ====== Modal policy
  const policyModal = document.getElementById('policyModal');
  const openPolicy = document.getElementById('openPolicy');
  const closePolicy = document.getElementById('closePolicy');
  const okPolicy = document.getElementById('okPolicy');

  function setModal(open){
    if (!policyModal) return;
    policyModal.classList.toggle('is-open', open);
    policyModal.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  if (openPolicy) openPolicy.addEventListener('click', () => setModal(true));
  if (closePolicy) closePolicy.addEventListener('click', () => setModal(false));
  if (okPolicy) okPolicy.addEventListener('click', () => setModal(false));
  if (policyModal) policyModal.addEventListener('click', (e) => {
    if (e.target === policyModal) setModal(false);
  });

  // ====== Order form submit (без сервера: mailto-заглушка)
  const form = document.getElementById('orderForm');
  const hint = document.getElementById('orderHint');

  function setHint(text, ok=false){
    if (!hint) return;
    hint.textContent = text || '';
    hint.style.color = ok ? 'rgba(245,223,95,.9)' : 'var(--muted)';
  }

  if (form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fd = new FormData(form);
      const name = (fd.get('name') || '').toString().trim();
      const phone = (fd.get('phone') || '').toString().trim();
      const email = (fd.get('email') || '').toString().trim();
      const city = (fd.get('city') || '').toString().trim();
      const msg = (fd.get('message') || '').toString().trim();

      if (!name || !phone){
        setHint('Заполните имя и телефон.', false);
        return;
      }

      // Вариант без backend: открываем письмо (замени адрес на свой)
      const to = 'booking@example.com';
      const subject = encodeURIComponent('Заявка: Заказать концерт');
      const body = encodeURIComponent(
        `Имя: ${name}\nТелефон: ${phone}\nEmail: ${email}\nГород/площадка: ${city}\n\nСообщение:\n${msg}\n`
      );
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

      setHint('Открываю письмо…', true);
      // form.reset(); // если нужно чистить
    });
  }

  // ====== Custom cursor
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  let mx = window.innerWidth * 0.5;
  let my = window.innerHeight * 0.5;
  let x = mx, y2 = my;

  const lerp = (a, b, t) => a + (b - a) * t;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  function raf(){
    x = lerp(x, mx, 0.18);
    y2 = lerp(y2, my, 0.18);
    cursor.style.transform = `translate(${x}px, ${y2}px)`;
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // hover detection for "active links"
  const hoverSelector = [
    'a', 'button', 'input', 'textarea', 'select',
    '[role="button"]', '.js-cursor-hover'
  ].join(',');

  const setHover = (on) => cursor.classList.toggle('is-hover', on);

  document.addEventListener('mouseover', (e) => {
    const t = e.target;
    if (t && t.closest && t.closest(hoverSelector)) setHover(true);
  });

  document.addEventListener('mouseout', (e) => {
    const t = e.target;
    if (t && t.closest && t.closest(hoverSelector)) setHover(false);
  });

})();
