document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toast');

  let toastTimer = null;
  let isSubmitting = false;

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
    form.addEventListener('submit', async e => {
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

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Unexpected response');
        }

        const result = await res.json();

        if (!res.ok) {
          showToast(result.message || 'Ошибка отправки');
          return;
        }

        showToast(result.message || 'Заявка отправлена!');
        form.reset();
      } catch (err) {
        showToast('Ошибка сети. Попробуйте позже.');
      } finally {
        isSubmitting = false;
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
  }

  const phoneInput = form?.querySelector('input[type="tel"]');
  if (phoneInput) {
    phoneInput.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length === 0) { e.target.value = ''; return; }
      if (v[0] === '8') v = '7' + v.substring(1);
      if (v[0] !== '7') v = '7' + v;
      if (v.length > 11) v = v.substring(0, 11);
      let f = '+7';
      if (v.length > 1) f += ' (' + v.substring(1, 4);
      if (v.length >= 4) f += ') ' + v.substring(4, 7);
      if (v.length >= 7) f += '-' + v.substring(7, 9);
      if (v.length >= 9) f += '-' + v.substring(9, 11);
      e.target.value = f;
    });

    phoneInput.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && e.target.value === '+7 (') {
        e.target.value = '';
      }
    });
  }
});
