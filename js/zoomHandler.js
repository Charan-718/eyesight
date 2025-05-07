window.applyZoom = function () {
  const zoomPower = parseFloat(document.getElementById('zoomPower').value);
  const viewerContainer = document.body;

  if (isNaN(zoomPower)) {
    alert("Please enter a valid eye power.");
    return;
  }

  localStorage.setItem('zoomPower', zoomPower);
  const zoomLevel = calculateZoomFromzoomPower(zoomPower);
  viewerContainer.style.zoom = zoomLevel;
};

function calculateZoomFromzoomPower(zoomPower) {
  if (zoomPower < 0) {
    return 1 - Math.abs(zoomPower) * 0.1;
  } else if (zoomPower > 0) {
    return 1 + Math.abs(zoomPower) * 0.2;
  } else {
    return 1;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const savedzoomPower = parseFloat(localStorage.getItem('zoomPower'));

  if (!isNaN(savedzoomPower)) {
    const input = document.getElementById('zoomPower');
    if (input) input.value = savedzoomPower;

    const zoomLevel = calculateZoomFromzoomPower(savedzoomPower);
    document.body.style.zoom = zoomLevel;
  }
});
