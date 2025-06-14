const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');

let drawing = false;

// Set drawing style
ctx.lineWidth = 2;
ctx.lineCap = 'round';
ctx.strokeStyle = '#000';

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

function getX(e) {
  return e.clientX - canvas.getBoundingClientRect().left;
}

function getY(e) {
  return e.clientY - canvas.getBoundingClientRect().top;
}

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