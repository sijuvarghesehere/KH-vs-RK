import { db, ref, set, onValue, update } from "./firebase.js";

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

const khScoreEl = document.getElementById("khScore");
const rkScoreEl = document.getElementById("rkScore");
const drawScoreEl = document.getElementById("drawScore");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const roomInput = document.getElementById("roomInput");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "KH";

let roomId = "";
let playerRole = "";

let khWins = 0;
let rkWins = 0;
let draws = 0;

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



// ======================
// CREATE ROOM
// ======================

createRoomBtn.onclick = () => {

  roomId = Math.random().toString(36).substring(2, 8);

  playerRole = "KH";

  set(ref(db, "rooms/" + roomId), {
    board: ["", "", "", "", "", "", "", "", ""],
    turn: "KH",
    winner: "",
    player1: true,
    player2: false
  });

  roomInput.value = roomId;

  listenToRoom();

  alert("Room Created: " + roomId);
};



// ======================
// JOIN ROOM
// ======================

joinRoomBtn.onclick = () => {

  roomId = roomInput.value.trim();

  if(roomId === "") {
    alert("Enter Room Code");
    return;
  }

  playerRole = "RK";

  update(ref(db, "rooms/" + roomId), {
    player2: true
  });

  listenToRoom();

  alert("Joined Room: " + roomId);
};



// ======================
// LISTEN TO ROOM
// ======================

function listenToRoom() {

  const roomRef = ref(db, "rooms/" + roomId);

  onValue(roomRef, (snapshot) => {

    const data = snapshot.val();

    if(!data) return;

    board = data.board;
    currentPlayer = data.turn;

    updateBoardUI();

  });
}



// ======================
// CELL CLICK
// ======================

cells.forEach((cell, index) => {

  cell.addEventListener("click", () => {

    if(roomId === "") {
      alert("Create or Join Room First");
      return;
    }

    if(board[index] !== "") return;

    if(currentPlayer !== playerRole) return;

    board[index] = currentPlayer;

    let nextTurn = currentPlayer === "KH" ? "RK" : "KH";

    const winner = checkWinner();

    if(winner) {

      if(winner === "KH") khWins++;
      if(winner === "RK") rkWins++;
      if(winner === "DRAW") draws++;

      updateScores();

      update(ref(db, "rooms/" + roomId), {
        board: board,
        turn: currentPlayer,
        winner: winner
      });

      if(winner === "DRAW") {
        statusText.innerText = "Draw Match";
      } else {
        statusText.innerText = winner + " Wins";
      }

      return;
    }

    update(ref(db, "rooms/" + roomId), {
      board: board,
      turn: nextTurn
    });

  });

});



// ======================
// UPDATE BOARD UI
// ======================

function updateBoardUI() {

  cells.forEach((cell, index) => {

    cell.innerText = board[index];

    cell.classList.remove("kh");
    cell.classList.remove("rk");

    if(board[index] === "KH") {
      cell.classList.add("kh");
    }

    if(board[index] === "RK") {
      cell.classList.add("rk");
    }

  });

  statusText.innerText = currentPlayer + " Turn";

}



// ======================
// CHECK WINNER
// ======================

function checkWinner() {

  for(let pattern of winPatterns) {

    const [a, b, c] = pattern;

    if(
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a];
    }

  }

  if(!board.includes("")) {
    return "DRAW";
  }

  return null;
}



// ======================
// UPDATE SCORES
// ======================

function updateScores() {

  khScoreEl.innerText = khWins;
  rkScoreEl.innerText = rkWins;
  drawScoreEl.innerText = draws;

}



// ======================
// RESTART GAME
// ======================

restartBtn.onclick = () => {

  if(roomId === "") return;

  board = ["", "", "", "", "", "", "", "", ""];

  update(ref(db, "rooms/" + roomId), {
    board: board,
    turn: "KH",
    winner: ""
  });

};



// ======================
// INITIAL UI
// ======================

updateBoardUI();
