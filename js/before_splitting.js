// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

document.addEventListener('DOMContentLoaded', function() {
  const fileUpload = document.getElementById('fileUpload');
  const uploadBtn = document.getElementById('uploadBtn');
  const fileContainer = document.getElementById('fileContainer');
  const noFilesMessage = document.getElementById('noFilesMessage');
  const storageWarning = document.getElementById('storageWarning');
  const warningMessage = document.getElementById('warningMessage');
  
  // Global variables for PDF viewer
  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  let pageNumPending = null;
  let scale = 1.0;
  let canvas = null;
  let ctx = null;
  
  // Check for localStorage support
  function isLocalStorageAvailable() {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
  }
  
  if (!isLocalStorageAvailable()) {
    showWarning("Your browser doesn't support localStorage. Files won't persist between sessions.");
  }
  
  // Load files from localStorage
  loadFiles();
  
  // Handle file upload
  uploadBtn.addEventListener('click', function() {
    if (!fileUpload.files.length) {
      alert('Please select a file to upload.');
      return;
    }
    
    const file = fileUpload.files[0];
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF and image files (JPG, PNG, GIF) are allowed.');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should not exceed 5MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
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
      
      // Clear the file input
      fileUpload.value = '';
    };
    
    reader.onerror = function() {
      alert('Error reading the file. Please try again.');
    };
    
    reader.readAsDataURL(file);
  });
  
  // Save file to localStorage
  function saveFile(fileData) {
    try {
      // Get existing files
      let files = JSON.parse(localStorage.getItem('storedFiles')) || [];
      
      // Check storage limit (roughly estimate)
      const storageUsed = calculateStorageSize(files);
      const fileSize = fileData.data.length * 2; // Rough estimate of string size in bytes
      
      // If adding new file would exceed ~5MB total (safe limit for localStorage)
      if (storageUsed + fileSize > 5 * 1024 * 1024) {
        showWarning("Warning: Storage limit approaching. Some older files may need to be removed.");
      }
      
      // Add new file
      files.push(fileData);
      
      // Save to localStorage
      localStorage.setItem('storedFiles', JSON.stringify(files));
      
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      
      if (e.name === 'QuotaExceededError') {
        alert('Storage quota exceeded. Please delete some files before adding new ones.');
      } else {
        alert('Error saving file. Try removing some existing files first.');
      }
    }
  }
  
  // Calculate rough size of stored data
  function calculateStorageSize(files) {
    if (!files || !files.length) return 0;
    
    let totalSize = 0;
    files.forEach(file => {
      totalSize += file.data ? file.data.length * 2 : 0; // Rough estimate
    });
    
    return totalSize;
  }
  
  // Load files from localStorage
  function loadFiles() {
    try {
      const files = JSON.parse(localStorage.getItem('storedFiles')) || [];
      
      files.forEach(fileData => {
        addFileCard(fileData);
      });
      
      checkNoFiles();
      
    } catch (e) {
      console.error('Error loading files from localStorage:', e);
      showWarning("Error loading saved files. Storage may be corrupted.");
    }
  }
  
  // Add file card to the UI
  function addFileCard(fileData) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-4 col-sm-6 col-lg-3';
    colDiv.setAttribute('data-file-id', fileData.id);
    
    const isPdf = fileData.type === 'application/pdf';
    const isImage = fileData.type.startsWith('image/');
    
    const fileSize = formatFileSize(fileData.size);
    const dateAdded = new Date(fileData.dateAdded).toLocaleDateString();
    
    colDiv.innerHTML = `
      <div class="card file-card">
        <button type="button" class="btn btn-danger btn-sm remove-btn" data-file-id="${fileData.id}">
          <i class="fas fa-times"></i>
        </button>
        <div class="card-body">
          <div class="file-preview mb-3">
            ${isPdf ? 
              `<i class="fas fa-file-pdf pdf-icon"></i>` : 
              `<img src="${fileData.data}" alt="${fileData.name}">`
            }
          </div>
          <h5 class="card-title file-info text-truncate" title="${fileData.name}">${fileData.name}</h5>
          <p class="card-text">
            <small class="text-muted">
              ${fileSize} • Added: ${dateAdded}
            </small>
          </p>
          ${isPdf ? 
            `<button class="btn btn-sm btn-outline-primary w-100 view-pdf-btn" data-pdf-id="${fileData.id}">
              <i class="fas fa-eye me-1"></i> View PDF
            </button>` : 
            `<button class="btn btn-sm btn-outline-primary w-100 view-image-btn" data-image-id="${fileData.id}">
              <i class="fas fa-eye me-1"></i> View Image
            </button>`
          }
        </div>
      </div>
    `;
    
    fileContainer.appendChild(colDiv);
    
    // Add event listener to remove button
    const removeBtn = colDiv.querySelector('.remove-btn');
    removeBtn.addEventListener('click', function() {
      const fileId = this.getAttribute('data-file-id');
      removeFile(fileId);
    });
    
    // Add event listener for PDF view button
    const pdfBtn = colDiv.querySelector('.view-pdf-btn');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', function() {
        const fileId = this.getAttribute('data-pdf-id');
        viewPdf(fileId);
      });
    }
    
    // Add event listener for image view button
    const imageBtn = colDiv.querySelector('.view-image-btn');
    if (imageBtn) {
      imageBtn.addEventListener('click', function() {
        const fileId = this.getAttribute('data-image-id');
        viewImage(fileId);
      });
    }
  }
  
  // Format file size
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }
  
  // Remove file
  function removeFile(fileId) {
    // Remove from UI
    const fileElement = document.querySelector(`[data-file-id="${fileId}"]`);
    if (fileElement) {
      fileElement.remove();
    }
    
    // Remove from localStorage
    try {
      let files = JSON.parse(localStorage.getItem('storedFiles')) || [];
      files = files.filter(file => file.id !== fileId);
      localStorage.setItem('storedFiles', JSON.stringify(files));
      
      checkNoFiles();
    } catch (e) {
      console.error('Error removing file from localStorage:', e);
    }
  }
  
  // View Image
  function viewImage(fileId) {
    const files = JSON.parse(localStorage.getItem('storedFiles')) || [];
    const imageFile = files.find(file => file.id === fileId);
    
    if (imageFile) {
      // Create modal for image viewing
      const modal = document.createElement('div');
      modal.className = 'custom-modal';
      modal.innerHTML = `
        <div class="modal-close">
          <i class="fas fa-times fa-lg"></i>
        </div>
        <div class="image-container">
          <img src="${imageFile.data}" alt="${imageFile.name}">
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Close modal when close button is clicked
      const closeBtn = modal.querySelector('.modal-close');
      closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
      });
      
      // Close modal when clicking outside the image
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
    }
  }
  
  // View PDF using PDF.js
  function viewPdf(fileId) {
    const files = JSON.parse(localStorage.getItem('storedFiles')) || [];
    const pdfFile = files.find(file => file.id === fileId);
    
    if (pdfFile) {
      // Create modal for PDF viewing
      const modal = document.createElement('div');
      modal.className = 'custom-modal';
      modal.innerHTML = `
        <div class="modal-close">
          <i class="fas fa-times fa-lg"></i>
        </div>
        <div class="pdf-container">
          <div class="pdf-toolbar">
            <button class="btn btn-sm btn-outline-secondary" id="prev">
              <i class="fas fa-chevron-left"></i> Previous
            </button>
            <button class="btn btn-sm btn-outline-secondary" id="next">
              Next <i class="fas fa-chevron-right"></i>
            </button>
            <div class="mx-2">
              <span>Page: <span id="page_num"></span> / <span id="page_count"></span></span>
            </div>
            <button class="btn btn-sm btn-outline-secondary" id="zoom-in">
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
      
      // Set up canvas
      canvas = document.getElementById('pdf-canvas');
      ctx = canvas.getContext('2d');
      
      // Get PDF buttons
      const prevButton = document.getElementById('prev');
      const nextButton = document.getElementById('next');
      const zoomInButton = document.getElementById('zoom-in');
      const zoomOutButton = document.getElementById('zoom-out');
      const pageNumSpan = document.getElementById('page_num');
      const pageCountSpan = document.getElementById('page_count');
      const zoomLevelSpan = document.getElementById('zoom-level');
      
      // Close modal when close button is clicked
      const closeBtn = modal.querySelector('.modal-close');
      closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
      });
      
      // Load the PDF
      const loadingTask = pdfjsLib.getDocument(pdfFile.data);
      loadingTask.promise.then(function(pdf) {
        pdfDoc = pdf;
        const numPages = pdf.numPages;
        pageCountSpan.textContent = numPages;
        
        // Initial render of first page
        renderPage(pageNum);
        
        // Previous page button
        prevButton.addEventListener('click', function() {
          if (pageNum <= 1) return;
          pageNum--;
          queueRenderPage(pageNum);
        });
        
        // Next page button
        nextButton.addEventListener('click', function() {
          if (pageNum >= pdfDoc.numPages) return;
          pageNum++;
          queueRenderPage(pageNum);
        });
        
        // Zoom in button
        zoomInButton.addEventListener('click', function() {
          if (scale >= 3.0) return;
          scale += 0.25;
          zoomLevelSpan.textContent = Math.round(scale * 100) + '%';
          queueRenderPage(pageNum);
        });
        
        // Zoom out button
        zoomOutButton.addEventListener('click', function() {
          if (scale <= 0.5) return;
          scale -= 0.25;
          zoomLevelSpan.textContent = Math.round(scale * 100) + '%';
          queueRenderPage(pageNum);
        });
      }).catch(function(error) {
        console.error('Error loading PDF:', error);
        alert('Error loading PDF. The file might be corrupted.');
      });
    }
  }
  
  // Render PDF page
  function renderPage(num) {
    pageRendering = true;
    
    // Update UI
    document.getElementById('page_num').textContent = num;
    
    // Get page
    pdfDoc.getPage(num).then(function(page) {
      // Set scale for rendering
      const viewport = page.getViewport({ scale: scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render PDF page
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      const renderTask = page.render(renderContext);
      
      // Wait for rendering to finish
      renderTask.promise.then(function() {
        pageRendering = false;
        
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      }).catch(function(error) {
        console.error('Error rendering page:', error);
        pageRendering = false;
      });
    }).catch(function(error) {
      console.error('Error getting page:', error);
      pageRendering = false;
    });
  }
  
  // Queue rendering for when previous render is still in progress
  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }
  
  // Check if no files and show message
  function checkNoFiles() {
    const hasFiles = fileContainer.children.length > 0;
    noFilesMessage.style.display = hasFiles ? 'none' : 'block';
  }
  
  // Show warning message
  function showWarning(message) {
    warningMessage.textContent = message;
    storageWarning.style.display = 'block';
  }



  
});