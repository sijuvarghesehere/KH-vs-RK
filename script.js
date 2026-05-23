// =========================
// FIREBASE DATABASE
// =========================

const db = firebase.database();

// =========================
// ELEMENTS
// =========================

const tiles = document.querySelectorAll(".tile");

const turnText = document.getElementById("turnText");

const restartBtn = document.getElementById("restartBtn");

const khScoreText = document.getElementById("khScore");
const rkScoreText = document.getElementById("rkScore");
const drawScoreText = document.getElementById("drawScore");

const twoPlayerBtn = document.getElementById("twoPlayerBtn");
const vsComputerBtn = document.getElementById("vsComputerBtn");
const onlineBtn = document.getElementById("onlineBtn");

const roomInput = document.getElementById("roomInput");
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");

const chooseKHBtn = document.getElementById("chooseKHBtn");
const chooseRKBtn = document.getElementById("chooseRKBtn");

// =========================
// GAME VARIABLES
// =========================

let board = ["", "", "", "", "", "", "", "", ""];

let currentTurn = "KH";

let gameOver = false;

let khScore = 0;
let rkScore = 0;
let drawScore = 0;

let gameMode = "2player";

let playerRole = "KH";

let roomId = "";

// =========================
// WIN PATTERNS
// =========================

const winPatterns = [
  [0,1,2],
  [3,4,5],
  [6,7,8],

  [0,3,6],
  [1,4,7],
  [2,5,8],

  [0,4,8],
  [2,4,6]
];

// =========================
// MODE BUTTONS
// =========================

twoPlayerBtn.onclick = () => {

  gameMode = "2player";

  activateModeButton(twoPlayerBtn);

};

vsComputerBtn.onclick = () => {

  gameMode = "computer";

  activateModeButton(vsComputerBtn);

};

onlineBtn.onclick = () => {

  gameMode = "online";

  activateModeButton(onlineBtn);

};

function activateModeButton(activeBtn){

  twoPlayerBtn.classList.remove("active");
  vsComputerBtn.classList.remove("active");
  onlineBtn.classList.remove("active");

  activeBtn.classList.add("active");

}

// =========================
// PLAYER CHOOSE
// =========================

chooseKHBtn.onclick = () => {

  playerRole = "KH";

  chooseKHBtn.classList.add("active");
  chooseRKBtn.classList.remove("active");

};

chooseRKBtn.onclick = () => {

  playerRole = "RK";

  chooseRKBtn.classList.add("active");
  chooseKHBtn.classList.remove("active");

};

// Default

chooseKHBtn.classList.add("active");
twoPlayerBtn.classList.add("active");

// =========================
// TILE CLICK
// =========================

tiles.forEach((tile, index) => {

  tile.onclick = () => {

    if(gameOver) return;

    if(board[index] !== "") return;

    // =====================
    // ONLINE MODE
    // =====================

    if(gameMode === "online"){

      if(currentTurn !== playerRole) return;

      board[index] = playerRole;

      currentTurn =
        playerRole === "KH"
        ? "RK"
        : "KH";

      firebase.database()
        .ref("rooms/" + roomId)
        .update({
          board: board,
          turn: currentTurn
        });

      return;

    }

    // =====================
    // OFFLINE
    // =====================

    board[index] = currentTurn;

    renderBoard();

    checkWinner();

    if(gameOver) return;

    currentTurn =
      currentTurn === "KH"
      ? "RK"
      : "KH";

    turnText.innerText =
      currentTurn + " Turn";

    // =====================
    // COMPUTER
    // =====================

    if(
      gameMode === "computer" &&
      currentTurn === "RK"
    ){

      setTimeout(computerMove, 500);

    }

  };

});

// =========================
// COMPUTER MOVE
// =========================

function computerMove(){

  if(gameOver) return;

  let emptyTiles = [];

  board.forEach((cell, index) => {

    if(cell === ""){
      emptyTiles.push(index);
    }

  });

  if(emptyTiles.length === 0) return;

  let randomIndex =
    emptyTiles[
      Math.floor(
        Math.random() * emptyTiles.length
      )
    ];

  board[randomIndex] = "RK";

  renderBoard();

  checkWinner();

  if(gameOver) return;

  currentTurn = "KH";

  turnText.innerText = "KH Turn";

}

// =========================
// RENDER BOARD
// =========================

function renderBoard(){

  tiles.forEach((tile, index) => {

    tile.innerText = board[index];

    tile.classList.remove("kh");
    tile.classList.remove("rk");

    if(board[index] === "KH"){

      tile.classList.add("kh");

    }

    if(board[index] === "RK"){

      tile.classList.add("rk");

    }

  });

}

// =========================
// CHECK WINNER
// =========================

function checkWinner(){

  for(let pattern of winPatterns){

    let [a,b,c] = pattern;

    if(
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ){

      gameOver = true;

      if(board[a] === "KH"){

        khScore++;

        khScoreText.innerText = khScore;

      }else{

        rkScore++;

        rkScoreText.innerText = rkScore;

      }

      turnText.innerText =
        board[a] + " Wins";

      return;

    }

  }

  // DRAW

  if(!board.includes("")){

    gameOver = true;

    drawScore++;

    drawScoreText.innerText = drawScore;

    turnText.innerText = "DRAW";

  }

}

// =========================
// RESTART
// =========================

restartBtn.onclick = () => {

  board = ["","","","","","","","",""];

  currentTurn = "KH";

  gameOver = false;

  turnText.innerText = "KH Turn";

  renderBoard();

  // ONLINE RESET

  if(gameMode === "online" && roomId !== ""){

    firebase.database()
      .ref("rooms/" + roomId)
      .update({
        board: board,
        turn: currentTurn,
        winner: ""
      });

  }

};

// =========================
// CREATE ROOM
// =========================

createRoomBtn.onclick = () => {

  gameMode = "online";

  activateModeButton(onlineBtn);

  let customCode =
    roomInput.value.trim();

  // RANDOM IF EMPTY

  if(customCode === ""){

    customCode =
      Math.random()
      .toString(36)
      .substring(2,8)
      .toUpperCase();

  }

  roomId =
    customCode
    .replace(/\s+/g, "")
    .toUpperCase();

  firebase.database()
    .ref("rooms/" + roomId)
    .set({

      board: ["","","","","","","","",""],

      turn: "KH",

      winner: "",

      player1: true,

      player2: false

    });

  roomInput.value = roomId;

  playerRole = "KH";

  listenToRoom();

  alert("Room Created: " + roomId);

};

// =========================
// JOIN ROOM
// =========================

joinRoomBtn.onclick = () => {

  gameMode = "online";

  activateModeButton(onlineBtn);

  roomId =
    roomInput.value
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();

  if(roomId === ""){

    alert("Enter Room Code");

    return;

  }

  firebase.database()
    .ref("rooms/" + roomId + "/player2")
    .set(true);

  playerRole = "RK";

  listenToRoom();

  alert("Joined Room: " + roomId);

};

// =========================
// LIVE ROOM SYNC
// =========================

function listenToRoom(){

  firebase.database()
    .ref("rooms/" + roomId)
    .on("value", (snapshot) => {

      const data = snapshot.val();

      if(!data) return;

      board = data.board;

      currentTurn = data.turn;

      renderBoard();

      turnText.innerText =
        currentTurn + " Turn";

      checkWinner();

    });

}

// =========================
// INITIAL BOARD
// =========================

renderBoard();

console.log("KH vs RK Running");
