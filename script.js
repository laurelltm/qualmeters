const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const desktopBreakpoint = window.matchMedia('(min-width: 1181px)');

const normalizePath = (value) => {
  const url = new URL(value, window.location.origin);
  if (url.pathname === '/') return '/';
  return url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
};

const closestElement = (target, selector) => (
  target instanceof Element ? target.closest(selector) : null
);

const closeMobileNav = () => {
  if (!menuToggle || !mobileNav) return;
  mobileNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
};

const closeDropdown = (item) => {
  item.classList.remove('is-open');
  const button = item.querySelector('button');
  if (button) button.setAttribute('aria-expanded', 'false');
};

const closeDropdowns = (except) => {
  document.querySelectorAll('.has-menu.is-open').forEach((item) => {
    if (item !== except) closeDropdown(item);
  });
};

if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    closeDropdowns();
  });

  mobileNav.addEventListener('click', (event) => {
    if (closestElement(event.target, 'a')) closeMobileNav();
  });
}

document.querySelectorAll('.has-menu').forEach((item, index) => {
  const button = item.querySelector(':scope > button');
  const menu = item.querySelector(':scope > .nav-menu');
  if (!button || !menu) return;

  const menuId = menu.id || `nav-menu-${index + 1}`;
  menu.id = menuId;
  button.setAttribute('aria-controls', menuId);
  button.setAttribute('aria-haspopup', 'true');

  button.addEventListener('click', () => {
    const isOpen = !item.classList.contains('is-open');
    closeDropdowns(item);
    item.classList.toggle('is-open', isOpen);
    button.setAttribute('aria-expanded', String(isOpen));
  });

  button.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    closeDropdowns(item);
    item.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    const links = Array.from(menu.querySelectorAll('a'));
    const target = event.key === 'ArrowUp' ? links[links.length - 1] : links[0];
    if (target) target.focus();
  });

  menu.addEventListener('keydown', (event) => {
    const links = Array.from(menu.querySelectorAll('a'));
    const currentIndex = links.indexOf(document.activeElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown(item);
      button.focus();
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const offset = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = (currentIndex + offset + links.length) % links.length;
      if (links[nextIndex]) links[nextIndex].focus();
    }
  });

  menu.addEventListener('click', (event) => {
    if (closestElement(event.target, 'a')) closeDropdown(item);
  });
});

document.addEventListener('click', (event) => {
  document.querySelectorAll('.has-menu.is-open').forEach((item) => {
    if (!item.contains(event.target)) {
      closeDropdown(item);
    }
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeMobileNav();
  closeDropdowns();
});

const handleDesktopBreakpoint = (event) => {
  if (event.matches) closeMobileNav();
};

if (desktopBreakpoint.addEventListener) {
  desktopBreakpoint.addEventListener('change', handleDesktopBreakpoint);
} else {
  desktopBreakpoint.addListener(handleDesktopBreakpoint);
}

const currentPath = normalizePath(window.location.pathname);
document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach((link) => {
  if (normalizePath(link.getAttribute('href')) !== currentPath) return;
  link.classList.add('is-active');
  link.setAttribute('aria-current', 'page');
  const parentMenu = link.closest('.has-menu');
  if (parentMenu) {
    const parentButton = parentMenu.querySelector(':scope > button');
    if (parentButton) parentButton.classList.add('is-active');
  }
});

document.querySelectorAll('[data-contact-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (status) {
      status.textContent = 'Thank you. This static prototype captured the inquiry locally; connect a production sales channel before publishing.';
    }
    form.reset();
  });
});
