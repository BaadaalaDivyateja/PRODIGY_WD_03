const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const player1Score = document.getElementById('player1Score');
const player2Score = document.getElementById('player2Score');
const botScore = document.getElementById('botScore');
const gamesPlayed = document.getElementById('gamesPlayed');
const resetBtn = document.getElementById('resetBtn');
const modeSwitch = document.getElementById('modeSwitch');

let currentPlayer = 'X';
let gameActive = true;
let boardState = Array(9).fill(null);
let player1Wins = 0;
let player2Wins = 0;
let botWins = 0;
let totalGames = 0;
let isBotMode = false;

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
modeSwitch.addEventListener('change', toggleMode);

function handleCellClick(e) {
    const index = e.target.dataset.index;
    if (boardState[index] || !gameActive) return;
    boardState[index] = currentPlayer;
    e.target.textContent = currentPlayer;
    checkResult();
    if (gameActive) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        if (isBotMode && currentPlayer === 'O') botMove();
    }
}

function botMove() {
    // Intermediate bot strategy
    let bestMove = getBestMove();
    boardState[bestMove] = 'O';
    cells[bestMove].textContent = 'O';
    checkResult();
    currentPlayer = 'X';
}

function getBestMove() {
    // Check for winning move
    for (let i = 0; i < boardState.length; i++) {
        if (!boardState[i]) {
            boardState[i] = 'O';
            if (checkWin('O')) {
                boardState[i] = null;
                return i;
            }
            boardState[i] = null;
        }
    }

    // Block player's winning move
    for (let i = 0; i < boardState.length; i++) {
        if (!boardState[i]) {
            boardState[i] = 'X';
            if (checkWin('X')) {
                boardState[i] = null;
                return i;
            }
            boardState[i] = null;
        }
    }

    // Choose center if available
    if (!boardState[4]) return 4;

    // Choose a random corner or side
    const availableCorners = [0, 2, 6, 8].filter(i => !boardState[i]);
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Choose any other available cell
    let availableCells = boardState.map((cell, index) => (cell === null ? index : null)).filter(val => val !== null);
    return availableCells[Math.floor(Math.random() * availableCells.length)];
}

function checkResult() {
    let roundWon = false;
    winningCombinations.forEach(combination => {
        const [a, b, c] = combination;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            roundWon = true;
            cells[a].classList.add('winning');
            cells[b].classList.add('winning');
            cells[c].classList.add('winning');
            drawWinningLine(a, b, c); // Draws the red line on the winning combination
            gameActive = false;
            updateScore(currentPlayer === 'X' ? 'Player 1' : (isBotMode ? 'Bot' : 'Player 2'));
        }
    });

    if (!boardState.includes(null) && !roundWon) {
        gameActive = false;
        updateScore('Draw');
    }
}

function drawWinningLine(a, b, c) {
    const line = document.createElement('div');
    line.classList.add('winning-line');
    board.appendChild(line);

    // Position and rotate the line based on winning cells
    const positions = [a, b, c].map(index => cells[index].getBoundingClientRect());
    const midPointX = (positions[0].x + positions[2].x) / 2;
    const midPointY = (positions[0].y + positions[2].y) / 2;
    line.style.left = `${midPointX - board.offsetLeft}px`;
    line.style.top = `${midPointY - board.offsetTop}px`;
    line.style.transform = `rotate(${getRotationAngle(a, c)}deg)`;
}

function getRotationAngle(a, c) {
    const angles = {
        0: { 1: 0, 2: 0, 4: 45, 8: 90 }, // Possible winning lines for index 0
        1: { 4: 0, 7: 0 },                // Possible winning lines for index 1
        2: { 5: 0, 8: 0, 4: -45, 6: 90 }, // Possible winning lines for index 2
        3: { 4: 90, 5: 0 },               // Possible winning lines for index 3
        6: { 7: 0, 8: 0 },                // Possible winning lines for index 6
    };
    return angles[a]?.[c - a] ?? 0; // Get angle based on position indexes
}

function updateScore(winner) {
    if (winner === 'Player 1') {
        player1Wins++;
        player1Score.textContent = player1Wins;
    } else if (winner === 'Player 2') {
        player2Wins++;
        player2Score.textContent = player2Wins;
    } else if (winner === 'Bot') {
        botWins++;
        botScore.textContent = botWins;
    }
    totalGames++;
    gamesPlayed.textContent = totalGames;
}

function resetGame() {
    boardState.fill(null);
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winning');
    });
    currentPlayer = 'X';
    gameActive = true;
    const line = document.querySelector('.winning-line');
    if (line) line.remove();
}

function toggleMode() {
    isBotMode = modeSwitch.checked;
    document.querySelector('.bot-row').style.display = isBotMode ? 'table-row' : 'none';
    resetGame();
}

function checkWin(player) {
    return winningCombinations.some(([a, b, c]) => boardState[a] === player && boardState[b] === player && boardState[c] === player);
}

