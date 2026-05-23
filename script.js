import { db, ref, set, onValue, update, get }
from "./firebase.js";



const cells =
document.querySelectorAll(".cell");

const statusText =
document.getElementById("status");

const restartBtn =
document.getElementById("restartBtn");



const khScoreEl =
document.getElementById("khScore");

const rkScoreEl =
document.getElementById("rkScore");

const drawScoreEl =
document.getElementById("drawScore");



const createRoomBtn =
document.getElementById("createRoomBtn");

const joinRoomBtn =
document.getElementById("joinRoomBtn");

const roomInput =
document.getElementById("roomInput");



const chooseKHBtn =
document.getElementById("chooseKH");

const chooseRKBtn =
document.getElementById("chooseRK");



// ======================
// VARIABLES
// ======================

let board =
["", "", "", "", "", "", "", "", ""];

let currentPlayer = "KH";

let roomId = "";

let playerRole = "";

let selectedRole = "KH";



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
// PLAYER SELECT
// ======================

chooseKHBtn.onclick = () => {

  selectedRole = "KH";

  chooseKHBtn.classList.add("active-role");

  chooseRKBtn.classList.remove("active-role");

};


chooseRKBtn.onclick = () => {

  selectedRole = "RK";

  chooseRKBtn.classList.add("active-role");

  chooseKHBtn.classList.remove("active-role");

};



// ======================
// CREATE ROOM
// ======================

createRoomBtn.onclick = () => {

  let customCode =
  roomInput.value.trim();


  if(customCode === "") {

    customCode =
    Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  }


  customCode = customCode
  .replace(/\s+/g, "")
  .toUpperCase();


  roomId = customCode;

  playerRole = selectedRole;


  set(ref(db, "rooms/" + roomId), {

    board: ["", "", "", "", "", "", "", "", ""],

    turn: "KH",

    winner: "",

    player1: true,

    player2: false,

    hostRole: playerRole

  });


  roomInput.value = roomId;

  listenToRoom();

  alert("Room Created: " + roomId);

};



// ======================
// JOIN ROOM
// ======================

joinRoomBtn.onclick = async () => {

  roomId =
  roomInput.value.trim();

  if(roomId === "") {

    alert("Enter Room Code");

    return;

  }


  const snapshot =
  await get(ref(db, "rooms/" + roomId));

  if(!snapshot.exists()) {

    alert("Room Not Found");

    return;

  }


  const data = snapshot.val();


  if(data.hostRole === selectedRole) {

    alert("Role Already Taken");

    return;

  }


  playerRole = selectedRole;


  update(ref(db, "rooms/" + roomId), {

    player2: true

  });


  listenToRoom();

  alert("Joined Room: " + roomId);

};



// ======================
// LISTEN ROOM
// ======================

function listenToRoom() {

  const roomRef =
  ref(db, "rooms/" + roomId);

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

      alert("Create or Join Room");

      return;

    }


    if(board[index] !== "") return;

    if(currentPlayer !== playerRole) return;


    board[index] = currentPlayer;


    let nextTurn =
    currentPlayer === "KH"
    ? "RK"
    : "KH";


    const winner =
    checkWinner();


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

        statusText.innerText =
        "Draw Match";

      } else {

        statusText.innerText =
        winner + " Wins";

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
// UPDATE UI
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


  statusText.innerText =
  currentPlayer + " Turn";

}



// ======================
// WINNER
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
// UPDATE SCORE
// ======================

function updateScores() {

  khScoreEl.innerText = khWins;

  rkScoreEl.innerText = rkWins;

  drawScoreEl.innerText = draws;

}



// ======================
// RESTART
// ======================

restartBtn.onclick = () => {

  if(roomId === "") return;


  board =
  ["", "", "", "", "", "", "", "", ""];


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

console.log("KH vs RK Multiplayer Running");
