// viewer.js
import { renderPdfModal } from './pdfRenderer.js';

export function viewImage(fileData) {
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  modal.innerHTML = `
    <div class="modal-close"><i class="fas fa-times fa-lg"></i></div>
    <div class="image-container"><img src="${fileData.data}" alt="${fileData.name}" class="zoomed-img" /></div>
  `;

  document.body.appendChild(modal);

  const imageContainer = modal.querySelector('.image-container');
  const img = imageContainer.querySelector('img');

  let scale = parseFloat(localStorage.getItem('zoomScale')) || 1;
  let posX = 0, posY = 0;
  let isDragging = false, startX, startY;

  function applyTransform() {
    // img.style.transform = `scale(${scale}) translate(${posX / scale}px, ${posY / scale}px)`;
    img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    img.style.transformOrigin = 'top left';
  }

  applyTransform();

  // ✅ Handle Zoom with Mouse Wheel / Trackpad
  let zoomTimeout;
  imageContainer.addEventListener('wheel', (e) => {
    e.preventDefault();

    if (zoomTimeout) return;
    zoomTimeout = setTimeout(() => {
      zoomTimeout = null;
    }, 30); // small delay for smoothness

    const zoomIntensity = 0.27;
    const delta = e.deltaY > 0 ? -1 : 1;
    const newScale = scale * (1 + delta * zoomIntensity);

    // Clamp scale within range
    scale = Math.min(6, Math.max(0.4, newScale));
    localStorage.setItem('zoomScale', scale.toFixed(2));
    applyTransform();
  });

  // ✅ Drag to move (mouse)
  imageContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
    imageContainer.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    imageContainer.style.cursor = 'grab';
  });

  // ✅ Touch drag support
  imageContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    isDragging = true;
    const touch = e.touches[0];
    startX = touch.clientX - posX;
    startY = touch.clientY - posY;
  }, { passive: false });

  imageContainer.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    posX = touch.clientX - startX;
    posY = touch.clientY - startY;
    applyTransform();
  }, { passive: false });

  imageContainer.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Close modal
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

export function viewPdf(fileData) {
  renderPdfModal(fileData);
}
