const cells =
  document.querySelectorAll(".cell");

const statusText =
  document.getElementById("status");

const restartBtn =
  document.getElementById("restartBtn");

const strike =
  document.getElementById("strike");

const board =
  document.getElementById("board");

let currentPlayer = "KH";

let gameActive = true;

let gameState = [

  "", "", "",
  "", "", "",
  "", "", ""

];

const winningConditions = [

  [0,1,2],
  [3,4,5],
  [6,7,8],

  [0,3,6],
  [1,4,7],
  [2,5,8],

  [0,4,8],
  [2,4,6]

];

cells.forEach(cell => {

  cell.addEventListener(
    "click",
    handleCellClick
  );

});

restartBtn.addEventListener(
  "click",
  restartGame
);

function handleCellClick(event) {

  const clickedCell =
    event.target;

  const clickedIndex =
    clickedCell.dataset.index;

  if (
    gameState[clickedIndex] !== "" ||
    !gameActive
  ) {
    return;
  }

  navigator.vibrate(50);

  gameState[clickedIndex] =
    currentPlayer;

  clickedCell.textContent =
    currentPlayer;

  if (currentPlayer === "KH") {

    clickedCell.classList.add("kh");

  } else {

    clickedCell.classList.add("rk");

  }

  checkWinner();
}

function checkWinner() {

  for (
    let i = 0;
    i < winningConditions.length;
    i++
  ) {

    const condition =
      winningConditions[i];

    const a =
      gameState[condition[0]];

    const b =
      gameState[condition[1]];

    const c =
      gameState[condition[2]];

    if (
      a === "" ||
      b === "" ||
      c === ""
    ) {
      continue;
    }

    if (a === b && b === c) {

      gameActive = false;

      navigator.vibrate(200);

      statusText.innerHTML =
        currentPlayer === "KH"
        ? "<span class='kh'>KH Wins!</span>"
        : "<span class='rk'>RK Wins!</span>";

      drawStrike(i);

      return;
    }
  }

  const roundDraw =
    !gameState.includes("");

  if (roundDraw) {

    statusText.innerHTML =
      "🤝 Draw Match";

    gameActive = false;

    return;
  }

  currentPlayer =
    currentPlayer === "KH"
    ? "RK"
    : "KH";

  statusText.innerHTML =
    currentPlayer === "KH"
    ? "<span class='kh'>KH Turn</span>"
    : "<span class='rk'>RK Turn</span>";
}

function drawStrike(index) {

  strike.style.display = "block";

  board.classList.add("win");

  winningConditions[index]
    .forEach(cellIndex => {

      cells[cellIndex]
        .classList.add("winner");

    });

  const positions = [

    {
      top: "16.5%",
      left: "0",
      width: "100%",
      height: "6px",
      transform: "none"
    },

    {
      top: "49.5%",
      left: "0",
      width: "100%",
      height: "6px",
      transform: "none"
    },

    {
      top: "83%",
      left: "0",
      width: "100%",
      height: "6px",
      transform: "none"
    },

    {
      top: "0",
      left: "16.5%",
      width: "6px",
      height: "100%",
      transform: "none"
    },

    {
      top: "0",
      left: "49.5%",
      width: "6px",
      height: "100%",
      transform: "none"
    },

    {
      top: "0",
      left: "83%",
      width: "6px",
      height: "100%",
      transform: "none"
    },

    {
      top: "50%",
      left: "50%",
      width: "140%",
      height: "6px",

      transform:
      "translate(-50%, -50%) rotate(45deg)"
    },

    {
      top: "50%",
      left: "50%",
      width: "140%",
      height: "6px",

      transform:
      "translate(-50%, -50%) rotate(-45deg)"
    }

  ];

  const position =
    positions[index];

  strike.style.top =
    position.top;

  strike.style.left =
    position.left;

  strike.style.width =
    position.width;

  strike.style.height =
    position.height;

  strike.style.transform =
    position.transform;
}

function restartGame() {

  currentPlayer = "KH";

  gameActive = true;

  gameState = [

    "", "", "",
    "", "", "",
    "", "", ""

  ];

  statusText.innerHTML =
    "<span class='kh'>KH Turn</span>";

  cells.forEach(cell => {

    cell.textContent = "";

    cell.classList.remove(
      "kh",
      "rk",
      "winner"
    );

  });

  board.classList.remove("win");

  strike.style.display = "none";
}