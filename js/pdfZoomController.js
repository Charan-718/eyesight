// pdfZoomController.js

export function increaseZoom(currentScale) {
    return currentScale * 1.3;
  }
  
export function decreaseZoom(currentScale) {
    return currentScale / 1.3;
}