export function showToast(message, type = 'success', timeoutMs = 2500) {
  let root = document.getElementById('toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    document.body.appendChild(root);
  }

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;

  root.appendChild(el);

  // плавное появление
  el.style.opacity = '0';
  el.style.transform = 'translateY(-6px)';
  requestAnimationFrame(() => {
    el.style.transition = 'all 200ms ease';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
    setTimeout(() => root.removeChild(el), 220);
  }, timeoutMs);
}
