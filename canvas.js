// (c) Dave Hulbert 2023

const canvas = document.getElementById('gameOfLifeCanvas');
const ctx = canvas.getContext('2d');

let cellSize = 8;
let rows, cols;
let hue = 300
var alpha = 0.17; // accessible to parent window
let currentGrid;
let nextGrid;

let canvasWidth, canvasHeight;

function debounce(func, delay) {
    let timer;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(context, args), delay);
    };
}

function createGrid(rows, cols) {
    return new Array(rows).fill(null).map(() => new Array(cols).fill(false));
}

const resizeCanvas = () => {
    if (Math.abs(canvas.width - window.innerWidth) < 80 && Math.abs(canvas.height - window.innerHeight) < 80) {
        return;
    }

    canvasHeight = window.innerHeight;
    canvasWidth = window.innerWidth;
    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    
    rows = Math.ceil(canvasHeight / cellSize);
    cols = Math.ceil(canvasWidth / cellSize);

    nextGrid = createGrid(rows, cols);
    currentGrid = createGrid(rows, cols).map(row => row.map(() => Math.random() > 0.8));

    currentGrid.forEach((row, y) => {
        row.forEach((cell, x) => {
            drawCell(x, y, cell);
        });
    });
};

function countNeighbors(grid, x, y) {
    let count = 0;
    for (let yy = -1; yy <= 1; yy++) {
        for (let xx = -1; xx <= 1; xx++) {
            if (xx === 0 && yy === 0) continue;
            if (y + yy < 0 || y + yy >= rows || x + xx < 0 || x + xx >= cols) continue;
            count += grid[y + yy][x + xx] ? 1 : 0;
        }
    }
    return count;
}

function drawCell(x, y, alive) {
    ctx.beginPath();
    ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
    ctx.fillStyle = alive ? 'hsla('+hue+', 91.39%, 59.02%, ' + alpha + ')' : 'rgba(255, 255, 255, '+alpha+')';
    ctx.fill();
}

// https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
function updateCellState(x, y) {
    const alive = currentGrid[y][x];
    const neighbors = countNeighbors(currentGrid, x, y);
    const nextState = alive ? neighbors === 2 || neighbors === 3 : neighbors === 3;

    if (nextState !== alive) {
        drawCell(x, y, nextState);
    }

    nextGrid[y][x] = nextState;
}

function update() {
    // This is what makes it change colours, using hsla()
    hue += 0.5;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            updateCellState(x, y);
        }
    }

    // Double buffering https://en.wikipedia.org/wiki/Multiple_buffering
    [currentGrid, nextGrid] = [nextGrid, currentGrid];
    requestAnimationFrame(update);
}

function handleInput(event) {
    let x, y, targetEvent;
    if (event.type === 'mousemove') {
        targetEvent = event;
    } else if (event.type === 'touchmove') {
        targetEvent = event.touches[0]
    }
    x = targetEvent.clientX;
    y = targetEvent.clientY;

    const rect = canvas.getBoundingClientRect();
    const gridX = Math.floor((x - rect.left) / cellSize);
    const gridY = Math.floor((y - rect.top) / cellSize);

    // draw a 2x2 square
    if (gridX >= 0 && gridX < cols-1 && gridY >= 0 && gridY < rows-1) {
        for (let i = 0; i <= 1; i++) {
            for (let j = 0; j <= 1; j++) {
                currentGrid[gridY + i][gridX + j] = true;
                drawCell(gridX + j, gridY + i, true);
            }
        }
    }
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('mousemove', debounce(handleInput, 10));
    window.addEventListener('touchmove', handleInput, { passive: false });
    window.addEventListener('resize', debounce(resizeCanvas, 250));

    resizeCanvas();
    update();
}

// todo: click to place a glider!
