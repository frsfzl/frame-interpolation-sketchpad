const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const frameSidebar = document.getElementById('frameSidebar');

let drawing = false;

// Drawing events
canvas.addEventListener('mousedown', e => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(getX(e), getY(e));
});

canvas.addEventListener('mousemove', e => {
  if (!drawing) return;
  ctx.lineTo(getX(e), getY(e));
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});

canvas.addEventListener('mouseleave', () => {
  drawing = false;
});

// Get mouse position
function getX(e) {
  return e.clientX - canvas.getBoundingClientRect().left;
}

function getY(e) {
  return e.clientY - canvas.getBoundingClientRect().top;
}

// Tool switching
let currentTool = 'draw';

function setTool(tool) {
  currentTool = tool;
  if (tool === 'draw') {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
  } else if (tool === 'erase') {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 10;
  }
}

// Save frame and clear canvas, then show faded previous frame as onion skin
function createNewFrame() {
  // Capture current frame as image
  const prevImage = new Image();
  prevImage.src = canvas.toDataURL();

  prevImage.onload = () => {
    // Save the current frame to the sidebar
    const frameImage = new Image();
    frameImage.src = prevImage.src;
    frameImage.style.border = "1px solid #aaa";
    frameImage.style.cursor = "pointer";
    frameSidebar.appendChild(frameImage);

    // Clear canvas and draw faded previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.3;
    ctx.drawImage(prevImage, 0, 0);
    ctx.globalAlpha = 1.0;
  };
}