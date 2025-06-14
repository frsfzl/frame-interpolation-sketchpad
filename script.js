const canvas = document.getElementById('drawCanvas');
const onionCanvas = document.getElementById('onionCanvas');
const ctx = canvas.getContext('2d');
const onionCtx = onionCanvas.getContext('2d');
const frameSidebar = document.getElementById('frameSidebar');

let drawing = false;
let currentTool = 'draw';
let lastFrame = null; // last user-only drawing (no onion)

ctx.lineCap = 'round';
ctx.lineWidth = 2;
ctx.strokeStyle = '#000';

// Make sure canvas width/height properties match actual pixel size (e.g., 960x720 if scaled 1.2x of 800x600)
canvas.width = 960;  
canvas.height = 720;
onionCanvas.width = 960;
onionCanvas.height = 720;

function getMousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}

canvas.addEventListener('mousedown', e => {
    drawing = true;
    const pos = getMousePos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
});

canvas.addEventListener('mousemove', e => {
    if (!drawing) return;
    const pos = getMousePos(canvas, e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

function setTool(tool) {
  currentTool = tool;

  // Clear selected class from all buttons
  document.querySelectorAll('.tool-button').forEach(btn => {
    btn.classList.remove('selected');
  });

  // Highlight the active tool
  const activeButton = document.getElementById(`tool-${tool}`);
  if (activeButton) {
    activeButton.classList.add('selected');
  }

  // Tool-specific logic
  if (tool === 'draw') {
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
  } else if (tool === 'erase') {
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 10;
  } else if (tool === 'clear') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (lastFrame) {
      onionCtx.clearRect(0, 0, onionCanvas.width, onionCanvas.height);
      onionCtx.globalAlpha = 0.3;
      onionCtx.drawImage(lastFrame, 0, 0);
      onionCtx.globalAlpha = 1.0;
    }
    // After clearing, switch back to draw mode
    setTool('draw');
  }
}

function createNewFrame() {
    // save only user's strokes (not onion)
    const cleanCanvas = document.createElement('canvas');
    cleanCanvas.width = canvas.width;
    cleanCanvas.height = canvas.height;
    const cleanCtx = cleanCanvas.getContext('2d');
    cleanCtx.drawImage(canvas, 0, 0);

    // save thumbnail with white bg + strokes only
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = '#fff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(cleanCanvas, 0, 0);

    const thumb = new Image();
    thumb.src = tempCanvas.toDataURL();
    thumb.classList.add('frame-thumb');
    frameSidebar.appendChild(thumb);

    // update onion with faded last frame
    lastFrame = cleanCanvas;
    onionCtx.clearRect(0, 0, onionCanvas.width, onionCanvas.height);
    onionCtx.globalAlpha = 0.3;
    onionCtx.drawImage(lastFrame, 0, 0);
    onionCtx.globalAlpha = 1.0;

    // clear draw canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function playFrames() {
  const thumbnails = document.querySelectorAll('.frame-thumb');
  if (thumbnails.length === 0) {
    alert("No frames to play!");
    return;
  }

  const popup = window.open('', '', 'width=900,height=750');
  if (!popup) return;

  popup.document.write(`
    <html>
      <head>
        <title>Frame Playback</title>
        <style>
          body {
            margin: 0;
            background-color: #f6f1e7;
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            gap: 20px;
          }
          canvas {
            border: 2px solid #b08861;
            background: #fff;
          }
          .controls {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .controls input[type="number"] {
            width: 60px;
            padding: 5px;
            font-size: 16px;
          }
          .controls button {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
          }
          .controls button img {
            width: 32px;
            height: 32px;
          }
          .slider {
            width: 600px;
          }
        </style>
      </head>
      <body>
        <canvas id="playbackCanvas" width="800" height="600"></canvas>
        <div class="controls">
          <label for="fps">FPS:</label>
          <input type="number" id="fps" value="5" min="1" max="60" />
          <button id="togglePlayPauseBtn">
            <img id="toggleIcon" src="images/play.png" alt="Play">
          </button>
          <input type="range" id="frameSlider" class="slider" min="0" max="${thumbnails.length - 1}" value="0">
        </div>

        <script>
          const frames = ${JSON.stringify([...thumbnails].map(img => img.src))};
          const canvas = document.getElementById('playbackCanvas');
          const ctx = canvas.getContext('2d');
          const fpsInput = document.getElementById('fps');
          const toggleBtn = document.getElementById('togglePlayPauseBtn');
          const toggleIcon = document.getElementById('toggleIcon');
          const frameSlider = document.getElementById('frameSlider');

          let currentIndex = 0;
          let intervalId = null;
          let isPlaying = false;

          function drawFrame(index) {
            const img = new Image();
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
            };
            img.src = frames[index];
          }

          function startPlayback() {
            const fps = Math.max(1, parseInt(fpsInput.value) || 5);
            intervalId = setInterval(() => {
              drawFrame(currentIndex);
              frameSlider.value = currentIndex;
              currentIndex = (currentIndex + 1) % frames.length;
            }, 1000 / fps);
            isPlaying = true;
            toggleIcon.src = "images/pause.png";
          }

          function pausePlayback() {
            clearInterval(intervalId);
            isPlaying = false;
            toggleIcon.src = "images/play.png";
          }

          toggleBtn.onclick = () => {
            if (isPlaying) {
              pausePlayback();
            } else {
              startPlayback();
            }
          };

          frameSlider.oninput = (e) => {
            currentIndex = parseInt(e.target.value);
            drawFrame(currentIndex);
            pausePlayback();
          };

          drawFrame(0); // Show the first frame initially
        <\/script>
      </body>
    </html>
  `);
}


