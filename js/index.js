import { isLocalStorageAvailable, showWarning, checkNoFiles } from './utils.js';
import { loadFiles, saveFile } from './storage.js';
import { handleFileUpload } from './fileHandlers.js';
import './eyeSightHandler.js'; // Just import it so the function is globally attached


document.addEventListener('DOMContentLoaded', () => {
  const uploadBtn = document.getElementById('uploadBtn');

  if (!isLocalStorageAvailable()) {
    showWarning("Your browser doesn't support localStorage. Files won't persist between sessions.");
  }

  loadFiles();
  checkNoFiles();

  // 👁️ Prefill eyePower input from localStorage if available
  const eyePowerInput = document.getElementById('eyePower');
  const savedEyePower = localStorage.getItem('eyePower');

  if (eyePowerInput && savedEyePower !== null) {
    eyePowerInput.value = savedEyePower;
  }

  uploadBtn.addEventListener('click', handleFileUpload);

  const adjustBtn = document.querySelector('#eye-power-section button');
  if (adjustBtn) {
    adjustBtn.addEventListener('click', () => {
      if (window.eyeSight) window.eyeSight();
    });
  }
});
