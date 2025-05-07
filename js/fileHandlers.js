import { saveFile } from './storage.js';
import { addFileCard, checkNoFiles } from './utils.js';

export function handleFileUpload() {
  const fileUpload = document.getElementById('fileUpload');
  const file = fileUpload.files[0];

  if (!file) return alert('Please select a file.');
  
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) return alert('Invalid file type.');
  if (file.size > 5 * 1024 * 1024) return alert('File exceeds 5MB.');

  const reader = new FileReader();
  reader.onload = (e) => {
    const fileData = {
      id: 'file_' + new Date().getTime(),
      name: file.name,
      type: file.type,
      size: file.size,
      data: e.target.result,
      dateAdded: new Date().toISOString()
    };

    saveFile(fileData);
    addFileCard(fileData);
    checkNoFiles();
    fileUpload.value = '';
  };

  reader.onerror = () => alert('File reading error.');
  reader.readAsDataURL(file);
}
