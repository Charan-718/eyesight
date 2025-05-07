import { viewPdf, viewImage } from './viewer.js';

export function isLocalStorageAvailable() {
  try {
    localStorage.setItem('__test__', '__test__');
    localStorage.removeItem('__test__');
    return true;
  } catch (e) {
    return false;
  }
}

export function calculateStorageSize(files) {
  return files.reduce((total, file) => total + (file.data?.length || 0) * 2, 0);
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  else if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function checkNoFiles() {
  const noFilesMessage = document.getElementById('noFilesMessage');
  const fileContainer = document.getElementById('fileContainer');
  noFilesMessage.style.display = fileContainer.children.length ? 'none' : 'block';
}

export function showWarning(message) {
  document.getElementById('warningMessage').textContent = message;
  document.getElementById('storageWarning').style.display = 'block';
}

export function addFileCard(fileData) {
  const fileContainer = document.getElementById('fileContainer');
  const card = document.createElement('div');
  card.className = 'col-md-4 col-sm-6 col-lg-3 mb-5';
  card.setAttribute('data-file-id', fileData.id);

  const isPdf = fileData.type === 'application/pdf';
  const previewHTML = isPdf
    ? `<i class="fas fa-file-pdf pdf-icon"></i>`
    : `<img src="${fileData.data}" alt="${fileData.name}">`;

  card.innerHTML = `
    <div class="card file-card">
      <button type="button" class="btn btn-danger btn-sm remove-btn" data-file-id="${fileData.id}">
        <i class="fas fa-times"></i>
      </button>
      <div class="card-body">
        <div class="file-preview mb-3">${previewHTML}</div>
        <h5 class="card-title file-info text-truncate" title="${fileData.name}">${fileData.name}</h5>
        <p class="card-text"><small class="text-muted">${formatFileSize(fileData.size)} • Added: ${new Date(fileData.dateAdded).toLocaleDateString()}</small></p>
        <button class="btn btn-sm btn-outline-success w-100 view-btn ${isPdf ? 'view-pdf-btn' : 'view-image-btn'}" data-file-id="${fileData.id}">
          <i class="fas fa-eye me-1"></i> View ${isPdf ? 'PDF' : 'Image'}
        </button>
      </div>
    </div>
  `;

  fileContainer.appendChild(card);

  card.querySelector('.remove-btn').addEventListener('click', () => {
    card.remove();
    let files = JSON.parse(localStorage.getItem('storedFiles')) || [];
    files = files.filter(f => f.id !== fileData.id);
    localStorage.setItem('storedFiles', JSON.stringify(files));
    checkNoFiles();
  });

  card.querySelector(`.view-${isPdf ? 'pdf' : 'image'}-btn`).addEventListener('click', () => {
    isPdf ? viewPdf(fileData) : viewImage(fileData);
  });
}
