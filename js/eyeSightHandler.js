import { updateZoomLevelDisplay } from './pdfRenderer.js'; // adjust the path if needed

window.pendingEyePowerZoomScale = null;
function applyEyePowerZoom(scale) {
    window.currentScale = scale;

    if (typeof window.updateZoomLevelDisplay === 'function') {
      window.updateZoomLevelDisplay(scale);
    } else {
      console.warn("updateZoomLevelDisplay is not available. PDF viewer might not be loaded yet.");
    }
    // Store scale for later use once PDF is ready
    window.pendingEyePowerZoomScale = scale;

    // if (typeof window.queueRenderPage === 'function') {
    //   window.queueRenderPage(window.currentPage || 1);
    // } else {
    //   console.warn("queueRenderPage is not available. Make sure PDF is loaded before applying zoom.");
    // }
  }

// const count=0;
export function eyeSight(fromTest = false) {
  const eyePowerInput = document.getElementById('eyePower');
  let eyePower;

  if (fromTest) {
    // If called from test, use the value from localStorage
    const storedPower = localStorage.getItem('eyePower');
    if (!storedPower || isNaN(parseFloat(storedPower))) {
      console.warn("No valid eye power found in storage.");
      return;
    }

    eyePower = parseFloat(storedPower);
    
    // ✅ Set the input field visually
    if (eyePowerInput) {
      eyePowerInput.value = eyePower;
    }
  } else {
    eyePower = parseFloat(eyePowerInput?.value);
    if (isNaN(eyePower)) {
      eyePowerInput?.classList.add('is-invalid');
      alert("Please enter a valid number for eye power.");
      return;
    }
    eyePowerInput?.classList.remove('is-invalid');
    localStorage.setItem('eyePower', eyePower);
  }
if (eyePower < -10 || eyePower > 5) {
  alert("Please enter a valid eye power between -10 and +5.");
  return;
}

  // localStorage.setItem('eyePower', eyePower);

  let newScale;

  if (eyePower < 0) {
  // Myopia (Nearsightedness) — zoom in
  const absPower = Math.abs(eyePower);

  if (absPower <= 0.5) newScale = 1.3;
  else if (absPower <= 1) newScale = 1.6;
  else if (absPower <= 1.5) newScale = 1.9;
  else if (absPower <= 2) newScale = 2.1;
  else if (absPower <= 2.5) newScale = 2.3;
  else if (absPower <= 3) newScale = 2.5;
  else if (absPower <= 4) newScale = 2.7;
  else if (absPower <= 5) newScale = 3.0;
  else if (absPower <= 6) newScale = 3.2;
  else newScale = 3.5; // absPower > 6

} else if (eyePower > 0) {
  // Hyperopia (Farsightedness) — zoom out
  if (eyePower <= 0.5) newScale = 0.97;
  else if (eyePower <= 1) newScale = 0.95;
  else if (eyePower <= 1.5) newScale = 0.93;
  else if (eyePower <= 2) newScale = 0.92;
  else if (eyePower <= 2.5) newScale = 0.91;
  else if (eyePower <= 3) newScale = 0.90;
  else if (eyePower <= 3.5) newScale = 0.89;
  else if (eyePower <= 4) newScale = 0.88;
  else if (eyePower <= 4.5) newScale = 0.87;
  else newScale = 0.86; // eyePower > 4.5

} else {
  // Normal vision
  newScale = 1;
} 

  // After applyEyePowerZoom(newScale);
  localStorage.setItem('zoomScale', newScale);  // 👈 store scale for later use

  applyEyePowerZoom(newScale);
}

window.eyeSight = eyeSight;