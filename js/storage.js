import { calculateStorageSize, showWarning, addFileCard, checkNoFiles } from './utils.js';

export function saveFile(fileData) {
  try {
    let files = JSON.parse(localStorage.getItem('storedFiles')) || [];
    const storageUsed = calculateStorageSize(files);
    const fileSize = fileData.data.length * 2;

    if (storageUsed + fileSize > 5 * 1024 * 1024) {
      showWarning("Warning: Storage limit approaching. Some older files may need to be removed.");
    }

    files.push(fileData);
    localStorage.setItem('storedFiles', JSON.stringify(files));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
    alert('Storage issue. Try removing some files.');
  }
}

export function loadFiles() {
  try {
    const files = JSON.parse(localStorage.getItem('storedFiles')) || [];
    files.forEach(fileData => addFileCard(fileData));
  } catch (e) {
    console.error('Error loading from localStorage:', e);
    showWarning("Error loading saved files. Storage may be corrupted.");
  }
}
