/**
 * App.js - Componentes UI y utilidades (SOLO FRONT-END)
 * Toast, Modal, helpers.
 */

const TOAST_DURATION = 3500;

function showToast(message, type = 'success') {
  const existing = document.querySelector('.app-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `app-toast app-toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.textContent = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, TOAST_DURATION);
}

function showModal(options) {
  const { title, content, onConfirm, onCancel, onOpen, confirmText = 'Confirmar', cancelText = 'Cancelar' } = options;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button type="button" class="modal-close" aria-label="Cerrar">&times;</button>
      </div>
      <div class="modal-body">${content}</div>
      <div class="modal-footer">
        ${onCancel ? `<button type="button" class="btn btn-outline modal-cancel">${cancelText}</button>` : ''}
        <button type="button" class="btn btn-primary modal-confirm">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
    if (onOpen) onOpen(overlay);
  });

  function close() {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.remove(), 300);
  }

  overlay.querySelector('.modal-confirm').addEventListener('click', () => {
    const result = onConfirm ? onConfirm(overlay) : true;
    if (result !== false) close();
  });

  if (onCancel) {
    overlay.querySelector('.modal-cancel').addEventListener('click', () => {
      onCancel();
      close();
    });
  }

  overlay.querySelector('.modal-close').addEventListener('click', () => {
    if (onCancel) onCancel();
    close();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      if (onCancel) onCancel();
      close();
    }
  });
}

