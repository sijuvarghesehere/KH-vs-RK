console.log("Game Running");

const cells = document.querySelectorAll(".cell");

const statusText = document.getElementById("statusText");

const restartBtn = document.getElementById("restartBtn");

const khScoreEl = document.getElementById("khScore");

const rkScoreEl = document.getElementById("rkScore");

const drawScoreEl = document.getElementById("drawScore");

const roomInput = document.getElementById("roomInput");

const createRoomBtn = document.getElementById("createRoomBtn");

const joinRoomBtn = document.getElementById("joinRoomBtn");

const chooseKH = document.getElementById("chooseKH");

const chooseRK = document.getElementById("chooseRK");

let board = ["","","","","","","","",""];

let currentPlayer = "KH";

let gameOver = false;

let playerRole = "KH";

let roomId = null;

let khScore = 0;

let rkScore = 0;

let drawScore = 0;

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

chooseKH.onclick = () => {

  playerRole = "KH";

  chooseKH.classList.add("activeSide");

  chooseRK.classList.remove("activeSide");

};

chooseRK.onclick = () => {

  playerRole = "RK";

  chooseRK.classList.add("activeSide");

  chooseKH.classList.remove("activeSide");

};

cells.forEach(cell => {

  cell.addEventListener("click", () => {

    const index = cell.dataset.index;

    if(board[index] !== "" || gameOver) return;

    board[index] = currentPlayer;

    renderBoard();

    checkWinner();

    currentPlayer = currentPlayer === "KH"
      ? "RK"
      : "KH";

    statusText.innerText = currentPlayer + " Turn";

    updateFirebase();

  });

});

function renderBoard() {

  cells.forEach((cell, index) => {

    cell.innerHTML = board[index];

    cell.classList.remove("khCell", "rkCell");

    if(board[index] === "KH") {

      cell.classList.add("khCell");

    }

    if(board[index] === "RK") {

      cell.classList.add("rkCell");

    }

  });

}

function checkWinner() {

  for(let combo of wins) {

    const [a,b,c] = combo;

    if(

      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]

    ) {

      gameOver = true;

      statusText.innerText = board[a] + " Wins";

      if(board[a] === "KH") {

        khScore++;

        khScoreEl.innerText = khScore;

      } else {

        rkScore++;

        rkScoreEl.innerText = rkScore;

      }

      return;

    }

  }

  if(!board.includes("")) {

    gameOver = true;

    statusText.innerText = "Draw";

    drawScore++;

    drawScoreEl.innerText = drawScore;

  }

}

restartBtn.onclick = () => {

  board = ["","","","","","","","",""];

  currentPlayer = "KH";

  gameOver = false;

  statusText.innerText = "KH Turn";

  renderBoard();

  updateFirebase();

};

createRoomBtn.onclick = () => {

  let customCode = roomInput.value.trim();

  if(customCode === "") {

    customCode = Math.random()
      .toString(36)
      .substring(2,8)
      .toUpperCase();

  }

  roomId = customCode;

  firebase.database().ref("rooms/" + roomId).set({

    board,

    currentPlayer,

    gameOver

  });

  listenRoom();

  alert("Room Created: " + roomId);

};

joinRoomBtn.onclick = () => {

  roomId = roomInput.value.trim();

  if(roomId === "") {

    alert("Enter Room Code");

    return;

  }

  listenRoom();

  alert("Joined Room: " + roomId);

};

function updateFirebase() {

  if(!roomId) return;

  firebase.database().ref("rooms/" + roomId).update({

    board,

    currentPlayer,

    gameOver

  });

}

function listenRoom() {

  firebase.database().ref("rooms/" + roomId)

    .on("value", snapshot => {

      const data = snapshot.val();

      if(!data) return;

      board = data.board;

      currentPlayer = data.currentPlayer;

      gameOver = data.gameOver;

      renderBoard();

      statusText.innerText = currentPlayer + " Turn";

    });

}

if("serviceWorker" in navigator) {

  navigator.serviceWorker.register("./sw.js")
    .then(() => {

      console.log("SW Registered");

    });

}
