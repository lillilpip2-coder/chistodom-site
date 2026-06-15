document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toast');

  let toastTimer = null;
  let isSubmitting = false;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
  }

  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      nav.classList.remove('open');
    });
  });

  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !burger.contains(e.target)) {
      burger.classList.remove('active');
      nav.classList.remove('open');
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (el) {
        const offset = 72;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (isSubmitting) return;

      const data = Object.fromEntries(new FormData(form));

      if (!data.name || data.name.trim().length < 2) {
        showToast('Введите имя (минимум 2 символа)');
        return;
      }

      if (!data.phone || data.phone.replace(/\D/g, '').length < 10) {
        showToast('Введите корректный номер телефона');
        return;
      }

      isSubmitting = true;
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Отправка...';
      submitBtn.disabled = true;

      showToast('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
      form.reset();

      setTimeout(() => {
        isSubmitting = false;
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 2000);
    });
  }

  const phoneInput = form?.querySelector('input[type="tel"]');
  if (phoneInput) {
    phoneInput.addEventListener('input', e => {
      const sel = e.target.selectionStart;
      const digitsBefore = e.target.value.slice(0, sel).replace(/\D/g, '').length;

      let d = e.target.value.replace(/\D/g, '');
      if (!d) { e.target.value = ''; return; }
      if (d[0] === '8') d = '7' + d.slice(1);
      if (d[0] !== '7') d = '7' + d;
      d = d.slice(0, 11);

      let f = '+7';
      if (d.length > 1) f += ' (' + d.slice(1, 4);
      if (d.length > 4) f += ') ' + d.slice(4, 7);
      if (d.length > 7) f += '-' + d.slice(7, 9);
      if (d.length > 9) f += '-' + d.slice(9, 11);
      e.target.value = f;

      let pos = 0;
      for (let i = 0, dc = 0; i < f.length && dc < digitsBefore; i++) {
        if (/\d/.test(f[i])) dc++;
        pos = i + 1;
      }
      e.target.setSelectionRange(pos, pos);
    });

    phoneInput.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && e.target.value === '+7 (') {
        e.target.value = '';
      }
    });
  }
});
