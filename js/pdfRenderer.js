// import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// import 'pdfjs-dist/build/pdf.worker.entry';

// renderPdfModal.js
import { increaseZoom, decreaseZoom } from './pdfZoomController.js';

export function updateZoomLevelDisplay(scale) {
  const zoomLevelElement = document.getElementById('zoom-level');
  if (zoomLevelElement) {
    zoomLevelElement.textContent = `${Math.round(scale * 100)}%`;
  }
}
window.updateZoomLevelDisplay = updateZoomLevelDisplay;
// window.queueRenderPage = queueRenderPage;
// window.currentPage = currentPage;

export function renderPdfModal(fileData) {
  const modal = document.createElement('div');
  modal.className = 'custom-modal pdf-modal';
  modal.innerHTML = `
        <div class="modal-close">
          <i class="fas fa-times fa-lg"></i>
        </div>
        <div class="pdf-container">
          <div class="pdf-toolbar">
            <button class="btn btn-sm btn-outline-secondary" id="prev-page">
              <i class="fas fa-chevron-left"></i> Previous
            </button>
            <button class="btn btn-sm btn-outline-secondary" id="next-page">
              Next <i class="fas fa-chevron-right"></i>
            </button>
            <div class="mx-2">
              <span>Page: <span id="page_num"></span> / <span id="page_count"></span></span>
            </div>
            <button class="btn btn-sm btn-outline-secondary me-3" id="zoom-in">
              <i class="fas fa-search-plus"></i>
            </button>
            <button class="btn btn-sm btn-outline-secondary" id="zoom-out">
              <i class="fas fa-search-minus"></i>
            </button>
            <div class="ms-2">
              <span id="zoom-level">100%</span>
            </div>
          </div>
          <div class="pdf-viewer">
            <canvas id="pdf-canvas"></canvas>
          </div>
        </div>
      `;
  document.body.appendChild(modal);

  // Modal close behavior
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Convert DataURL to Uint8Array (important for PDF.js to read it)
  const data = atob(fileData.data.split(',')[1]);
  const uint8Array = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    uint8Array[i] = data.charCodeAt(i);
  }

  let pdfDoc = null,
      currentPage = 1,
      scale = 1.5;

  const canvas = document.getElementById('pdf-canvas');
  const ctx = canvas.getContext('2d');

  function renderPage(pageNum) {
    pdfDoc.getPage(pageNum).then((page) => {
      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      page.render({ canvasContext: ctx, viewport });
    });
  }

  function queueRenderPage(num) {
    currentPage = num;
    renderPage(num);
  }

  pdfjsLib.getDocument({ data: uint8Array }).promise.then((pdf) => {
    pdfDoc = pdf;
    renderPage(currentPage);
  
    window.queueRenderPage = queueRenderPage;
    window.currentPage = currentPage;
    window.updateZoomLevelDisplay = updateZoomLevelDisplay;
    window.pdfViewerReady = true;

    // ✅ Apply zoom if set earlier
    if (window.pendingEyePowerZoomScale !== null) {
      scale = window.pendingEyePowerZoomScale;
      updateZoomLevelDisplay(scale);
      queueRenderPage(currentPage);
      window.pendingEyePowerZoomScale = null;
    }

    // 👁️ Automatically apply saved eye power zoom
  const savedEyePower = localStorage.getItem('eyePower');
  if (savedEyePower && typeof window.eyeSight === 'function') {
    const eyePowerInput = document.getElementById('eyePower');
    if (eyePowerInput) {
      eyePowerInput.value = savedEyePower;
    }
    window.eyeSight(); // 🚀 Apply zoom
  }
    
  });
  

  document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < pdfDoc.numPages) {
      currentPage++;
      queueRenderPage(currentPage);
    }
  });

  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      queueRenderPage(currentPage);
    }
  });

  window.queueRenderPage = queueRenderPage;
  window.currentPage = currentPage;

  document.getElementById('zoom-in').addEventListener('click', () => {
    scale = increaseZoom(scale);
    updateZoomLevelDisplay(scale);
    queueRenderPage(currentPage); 
  });
  
  document.getElementById('zoom-out').addEventListener('click', () => {
    scale = decreaseZoom(scale);
    updateZoomLevelDisplay(scale);
    queueRenderPage(currentPage);
  });
  
}