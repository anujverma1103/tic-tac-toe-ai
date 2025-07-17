const cells = document.querySelectorAll(".cell");
const messageElement = document.getElementById("message");
const restartButton = document.getElementById("restart-button");
const playAgainButton = document.getElementById("play-again-button");
const clearScoreboardButton = document.getElementById("clear-scoreboard-button");
const player1NameInput = document.getElementById("player1-name");
const player2NameInput = document.getElementById("player2-name");
const startGameButton = document.getElementById("start-game-button");
const gameSetupScreen = document.getElementById("game-setup");
const gameScreen = document.getElementById("game-screen");
const player1ScoreElement = document.getElementById("player1-score");
const player2ScoreElement = document.getElementById("player2-score");
const tiesScoreElement = document.getElementById("ties-score");
const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');
const player2InputContainer = document.getElementById("player2-input-container");
const themeToggleButton = document.getElementById("theme-toggle");
const winningLineElement = document.getElementById("winning-line");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;
const playerNames = { X: "Player 1", O: "Player 2" };
let scores = { X: 0, O: 0, ties: 0 };
let gameMode = "two-player";

// ✅ Corrected Audio Paths
let moveSound = new Audio("move.mp3");
let winSound = new Audio("win.mp3");
const tieSound = new Audio("tie.mp3");

const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const winningLineClasses = {
  "0,1,2": "row-0", "3,4,5": "row-1", "6,7,8": "row-2",
  "0,3,6": "col-0", "1,4,7": "col-1", "2,5,8": "col-2",
  "0,4,8": "diag-0", "2,4,6": "diag-1",
};

const loadScores = () => {
  const storedScores = localStorage.getItem("ticTacToeScores");
  if (storedScores) {
    scores = JSON.parse(storedScores);
    updateScoreboard();
  }
};

const saveScores = () => {
  localStorage.setItem("ticTacToeScores", JSON.stringify(scores));
};

const updateScoreboard = () => {
  player1ScoreElement.textContent = scores.X;
  player2ScoreElement.textContent = scores.O;
  tiesScoreElement.textContent = scores.ties;
};

const handleCellClick = (e) => {
  const cell = e.target;
  const index = parseInt(cell.getAttribute("data-cell-index"));

  if (board[index] !== "" || !isGameActive) return;

  makeMove(cell, index);
};

const makeMove = (cell, index) => {
  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer);
  try {
    moveSound.play();
  } catch (e) {
    console.warn("Move sound failed:", e);
  }

  cell.classList.add("clicked");
  setTimeout(() => cell.classList.remove("clicked"), 200);

  checkResult();
};

const checkResult = () => {
  let roundWon = false;
  let winningLine = null;

  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      roundWon = true;
      winningLine = winningConditions[i];
      break;
    }
  }

  if (roundWon) {
    messageElement.textContent = `${playerNames[currentPlayer]} has won!`;
    scores[currentPlayer]++;
    try {
      winSound.play();
    } catch (e) {
      console.warn("Win sound failed:", e);
    }
    isGameActive = false;
    saveScores();
    updateScoreboard();

    winningLine.forEach(i => cells[i].classList.add("winning-cell"));
    const lineClass = winningLineClasses[winningLine.join(",")];
    if (lineClass) winningLineElement.classList.add(lineClass);
    return;
  }

  if (!board.includes("")) {
    messageElement.textContent = "It's a tie!";
    scores.ties++;
    try {
      tieSound.play();
    } catch (e) {
      console.warn("Tie sound failed:", e);
    }
    isGameActive = false;
    saveScores();
    updateScoreboard();
    return;
  }

  changePlayer();
};

const changePlayer = () => {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  messageElement.textContent = `${playerNames[currentPlayer]}'s turn`;

  if (gameMode === "single-player" && currentPlayer === "O" && isGameActive) {
    setTimeout(aiMove, 700);
  }
};

const minimax = (newBoard, player) => {
  const availableSpots = newBoard.map((v, i) => (v === "" ? i : null)).filter(v => v !== null);
  for (const [a, b, c] of winningConditions) {
    if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[b] === newBoard[c]) {
      return { score: newBoard[a] === "X" ? -10 : 10 };
    }
  }
  if (availableSpots.length === 0) return { score: 0 };

  const moves = [];
  for (const i of availableSpots) {
    const move = { index: i };
    newBoard[i] = player;

    const result = minimax(newBoard, player === "O" ? "X" : "O");
    move.score = result.score;
    newBoard[i] = "";
    moves.push(move);
  }

  const best = moves.reduce((best, move, i) =>
    (player === "O" && move.score > best.score) || (player === "X" && move.score < best.score)
      ? { ...move, i }
      : best,
    { score: player === "O" ? -Infinity : Infinity }
  );
  return moves[best.i];
};

const aiMove = () => {
  const best = minimax(board, "O");
  if (best && best.index !== undefined) {
    makeMove(cells[best.index], best.index);
  }
};

const restartGame = () => {
  board = ["", "", "", "", "", "", "", "", ""];
  isGameActive = true;
  currentPlayer = "X";
  messageElement.textContent = `${playerNames.X}'s turn`;
  cells.forEach(cell => {
    cell.textContent = "";
    cell.className = "cell";
  });
  winningLineElement.className = "winning-line";

  if (gameMode === "single-player" && currentPlayer === "O") {
    setTimeout(aiMove, 700);
  }
};

const clearScoreboard = () => {
  if (confirm("Are you sure you want to clear all scores?")) {
    scores = { X: 0, O: 0, ties: 0 };
    saveScores();
    updateScoreboard();
    alert("Scoreboard cleared!");
  }
};

const startGame = () => {
  const p1 = player1NameInput.value.trim();
  const p2 = player2NameInput.value.trim();

  if (!p1) return alert("Enter Player 1 name.");
  playerNames.X = p1;

  if (gameMode === "single-player") {
    playerNames.O = "AI";
    player2NameInput.value = "AI";
  } else {
    if (!p2) return alert("Enter Player 2 name.");
    playerNames.O = p2;
  }

  document.getElementById("player1-name-display").textContent = playerNames.X;
  document.getElementById("player2-name-display").textContent = playerNames.O;

  gameSetupScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  messageElement.textContent = `${playerNames.X}'s turn`;
  loadScores();

  if (gameMode === "single-player" && currentPlayer === "O") {
    setTimeout(aiMove, 700);
  }
};

const enableDarkMode = () => {
  document.body.classList.add("dark-mode");
  localStorage.setItem("theme", "dark");
  themeToggleButton.querySelector(".icon").textContent = "🌙";
};

const disableDarkMode = () => {
  document.body.classList.remove("dark-mode");
  localStorage.setItem("theme", "light");
  themeToggleButton.querySelector(".icon").textContent = "💡";
};

const toggleTheme = () => {
  document.body.classList.contains("dark-mode") ? disableDarkMode() : enableDarkMode();
};

cells.forEach(cell => cell.addEventListener("click", handleCellClick));
restartButton.addEventListener("click", restartGame);
playAgainButton.addEventListener("click", restartGame);
clearScoreboardButton.addEventListener("click", clearScoreboard);
startGameButton.addEventListener("click", startGame);
themeToggleButton.addEventListener("click", toggleTheme);

gameModeRadios.forEach(radio => {
  radio.addEventListener("change", e => {
    gameMode = e.target.value;
    if (gameMode === "single-player") {
      player2InputContainer.classList.add("hidden");
      player2NameInput.value = "AI";
    } else {
      player2InputContainer.classList.remove("hidden");
      player2NameInput.value = "Player 2";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  if (gameMode === "single-player") {
    player2InputContainer.classList.add("hidden");
    player2NameInput.value = "AI";
  }

  const theme = localStorage.getItem("theme");
  theme === "dark" ? enableDarkMode() : disableDarkMode();
});
