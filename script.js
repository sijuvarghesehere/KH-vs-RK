console.log("Game Running");



// =====================
// FIREBASE
// =====================

const db = firebase.database();



// =====================
// ELEMENTS
// =====================

const cells = document.querySelectorAll(".cell");

const turnText = document.getElementById("turnText");

const restartBtn = document.getElementById("restartBtn");

const khScoreText = document.getElementById("khScore");

const rkScoreText = document.getElementById("rkScore");

const drawScoreText = document.getElementById("drawScore");

const roomInput = document.getElementById("roomInput");

const createRoomBtn = document.getElementById("createRoomBtn");

const joinRoomBtn = document.getElementById("joinRoomBtn");

const chooseKH = document.getElementById("chooseKH");

const chooseRK = document.getElementById("chooseRK");



// =====================
// VARIABLES
// =====================

let board = ["", "", "", "", "", "", "", "", ""];

let currentPlayer = "KH";

let gameOver = false;

let gameMode = "2P";

let playerRole = "KH";

let roomId = "";

let khScore = 0;

let rkScore = 0;

let drawScore = 0;



// =====================
// PLAYER SELECT
// =====================

chooseKH.onclick = () => {

  playerRole = "KH";

  chooseKH.classList.add("active-role");

  chooseRK.classList.remove("active-role");

};

chooseRK.onclick = () => {

  playerRole = "RK";

  chooseRK.classList.add("active-role");

  chooseKH.classList.remove("active-role");

};



// =====================
// GAME MODE
// =====================

document.getElementById("twoPlayerBtn").onclick = () => {

  gameMode = "2P";

};

document.getElementById("computerBtn").onclick = () => {

  gameMode = "CPU";

};

document.getElementById("onlineBtn").onclick = () => {

  gameMode = "ONLINE";

};



// =====================
// BOARD CLICK
// =====================

cells.forEach(cell => {

  cell.addEventListener("click", () => {

    const index = cell.dataset.index;

    handleMove(index);

  });

});



// =====================
// HANDLE MOVE
// =====================

function handleMove(index){

  if(gameOver) return;

  if(board[index] !== "") return;



  // ONLINE MODE

  if(gameMode === "ONLINE"){

    if(currentPlayer !== playerRole) return;

  }



  board[index] = currentPlayer;



  updateBoardUI();



  checkWinner();



  if(gameOver) return;



  currentPlayer = currentPlayer === "KH"
    ? "RK"
    : "KH";



  updateTurn();



  // CPU

  if(gameMode === "CPU" && currentPlayer === "RK"){

    setTimeout(computerMove, 500);

  }



  // FIREBASE UPDATE

  if(gameMode === "ONLINE"){

    updateRoom();

  }

}



// =====================
// COMPUTER MOVE
// =====================

function computerMove(){

  let empty = [];

  board.forEach((v, i) => {

    if(v === ""){

      empty.push(i);

    }

  });

  if(empty.length === 0) return;

  let randomIndex =
    empty[Math.floor(Math.random() * empty.length)];

  handleMove(randomIndex);

}



// =====================
// UPDATE BOARD UI
// =====================

function updateBoardUI(){

  cells.forEach((cell, index) => {

    cell.classList.remove("kh");

    cell.classList.remove("rk");



    if(board[index] === "KH"){

      cell.innerText = "K";

      cell.classList.add("kh");

    }

    else if(board[index] === "RK"){

      cell.innerText = "R";

      cell.classList.add("rk");

    }

    else{

      cell.innerText = "";

    }

  });

}



// =====================
// TURN UI
// =====================

function updateTurn(){

  turnText.innerText =
    currentPlayer + " Turn";

}



// =====================
// WINNER
// =====================

function checkWinner(){

  const wins = [

    [0,1,2],
    [3,4,5],
    [6,7,8],

    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6]

  ];



  for(let combo of wins){

    const [a,b,c] = combo;

    if(
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ){

      gameOver = true;

      turnText.innerText =
        board[a] + " Wins!";



      if(board[a] === "KH"){

        khScore++;

        khScoreText.innerText = khScore;

      }
      else{

        rkScore++;

        rkScoreText.innerText = rkScore;

      }



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



// =====================
// RESTART
// =====================

restartBtn.onclick = () => {

  board = ["", "", "", "", "", "", "", "", ""];

  currentPlayer = "KH";

  gameOver = false;



  updateBoardUI();

  updateTurn();



  if(gameMode === "ONLINE"){

    updateRoom();

  }

};



// =====================
// CREATE ROOM
// =====================

createRoomBtn.onclick = () => {

  let customCode =
    roomInput.value.trim();



  // RANDOM ROOM

  if(customCode === ""){

    customCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

  }



  customCode = customCode
    .replace(/\s+/g, "")
    .toUpperCase();



  roomId = customCode;



  setRoom();

};



// =====================
// JOIN ROOM
// =====================

joinRoomBtn.onclick = () => {

  roomId = roomInput.value
    .trim()
    .toUpperCase();



  if(roomId === ""){

    alert("Enter Room Code");

    return;

  }



  playerRole =
    playerRole === "KH"
    ? "RK"
    : "KH";



  listenRoom();

};



// =====================
// SET ROOM
// =====================

function setRoom(){

  db.ref("rooms/" + roomId).set({

    board: board,

    currentPlayer: currentPlayer,

    gameOver: gameOver

  });



  roomInput.value = roomId;



  listenRoom();



  alert("Room Created: " + roomId);

}



// =====================
// UPDATE ROOM
// =====================

function updateRoom(){

  db.ref("rooms/" + roomId).update({

    board: board,

    currentPlayer: currentPlayer,

    gameOver: gameOver

  });

}



// =====================
// LISTEN ROOM
// =====================

function listenRoom(){

  db.ref("rooms/" + roomId)
    .on("value", snapshot => {

      const data = snapshot.val();

      if(!data) return;



      board = data.board;

      currentPlayer =
        data.currentPlayer;

      gameOver =
        data.gameOver;



      updateBoardUI();

      updateTurn();

    });

}
