const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const frameSidebar = document.getElementById('frameSidebar');

let drawing = false;

// draws on canvas
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

// mouse position helpers
function getX(e) {
  return e.clientX - canvas.getBoundingClientRect().left;
}

function getY(e) {
  return e.clientY - canvas.getBoundingClientRect().top;
}

// switch between draw and erase
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

// stores frame data
let frames = [];

// modify createNewFrame to store frames
function createNewFrame() {
  // uses current canvas as previous frame
  const prevImage = new Image();
  prevImage.src = canvas.toDataURL();

  prevImage.onload = () => {
    // saves previous frame to sidebar
    const frameImage = new Image();
    frameImage.src = prevImage.src;
    frameImage.style.border = "1px solid #aaa";
    frameImage.style.cursor = "pointer";
    frameSidebar.appendChild(frameImage);

    // stores frame data
    frames.push(prevImage.src);

    // clears canvas for new frame and draws previous frame grayed out
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.3;
    ctx.drawImage(prevImage, 0, 0);
    ctx.globalAlpha = 1.0;
  };
}

// saves project
document.getElementById('saveProjectBtn').onclick = function() {
  if (frames.length === 0) {
    alert('No frames to save!');
    return;
  }
  const projectName = prompt('Enter a name for your project:');
  if (!projectName) return;
  let savedProjects = JSON.parse(localStorage.getItem('sketchpadProjects') || '{}');
  savedProjects[projectName] = frames;
  localStorage.setItem('sketchpadProjects', JSON.stringify(savedProjects));
  alert('Project saved!');
};

// opens project
document.getElementById('openProjectBtn').onclick = function() {
  const modal = document.getElementById('openProjectModal');
  const projectList = document.getElementById('projectList');
  projectList.innerHTML = '';
  let savedProjects = JSON.parse(localStorage.getItem('sketchpadProjects') || '{}');
  const names = Object.keys(savedProjects);
  if (names.length === 0) {
    projectList.innerHTML = '<p>No saved projects.</p>';
  } else {
    names.forEach(name => {
      const btn = document.createElement('button');
      btn.textContent = name;
      btn.style.margin = '4px 0';
      btn.onclick = function() {
        loadProject(name);
        closeProjectModal();
      };
      projectList.appendChild(btn);
      projectList.appendChild(document.createElement('br'));
    });
  }
  modal.style.display = 'flex';
};

function closeProjectModal() {
  document.getElementById('openProjectModal').style.display = 'none';
}

// let user load a project
function loadProject(name) {
  let savedProjects = JSON.parse(localStorage.getItem('sketchpadProjects') || '{}');
  if (!savedProjects[name]) return;
  frames = savedProjects[name].slice();
  // clear sidebar and canvas
  frameSidebar.innerHTML = '';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // show all frames in sidebar
  frames.forEach(src => {
    const frameImage = new Image();
    frameImage.src = src;
    frameImage.style.border = "1px solid #aaa";
    frameImage.style.cursor = "pointer";
    frameSidebar.appendChild(frameImage);
  });
  // draws the last frame on canvas
  if (frames.length > 0) {
    const lastImage = new Image();
    lastImage.src = frames[frames.length - 1];
    lastImage.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(lastImage, 0, 0);
    };
  }
}

// resets frames and canvas on load
window.onload = function() {
  frames = [];
  frameSidebar.innerHTML = '';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};