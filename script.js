console.log("Game Running");

const cells = document.querySelectorAll(".cell");

const statusText = document.getElementById("status");

const restartBtn = document.getElementById("restartBtn");

const khScoreText = document.getElementById("khScore");
const rkScoreText = document.getElementById("rkScore");
const drawScoreText = document.getElementById("drawScore");

const pvpBtn = document.getElementById("pvpBtn");
const aiBtn = document.getElementById("aiBtn");
const onlineBtn = document.getElementById("onlineBtn");

let currentPlayer = "KH";

let board = ["","","","","","","","",""];

let gameActive = true;

let gameMode = "pvp";

let khScore = 0;
let rkScore = 0;
let drawScore = 0;

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

pvpBtn.onclick = ()=>{
    gameMode = "pvp";
    setActiveButton(pvpBtn);
};

aiBtn.onclick = ()=>{
    gameMode = "ai";
    setActiveButton(aiBtn);
};

onlineBtn.onclick = ()=>{
    gameMode = "online";
    setActiveButton(onlineBtn);
};

function setActiveButton(btn){

    document.querySelectorAll(".mode-select button")
    .forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");
}

cells.forEach((cell,index)=>{

    cell.addEventListener("click",()=>{

        if(board[index] !== "" || !gameActive) return;

        makeMove(index,currentPlayer);

        if(gameMode === "ai" &&
            currentPlayer === "RK" &&
            gameActive){

            setTimeout(computerMove,500);
        }

    });

});

function makeMove(index,player){

    board[index] = player;

    cells[index].innerHTML = player;

    cells[index].classList.add(
        player === "KH" ? "kh" : "rk"
    );

    checkWinner();

    currentPlayer =
        currentPlayer === "KH" ? "RK" : "KH";

    if(gameActive){
        statusText.innerHTML =
            currentPlayer + " Turn";
    }
}

function computerMove(){

    let empty = [];

    board.forEach((v,i)=>{
        if(v === "") empty.push(i);
    });

    if(empty.length === 0) return;

    let random =
        empty[Math.floor(Math.random()*empty.length)];

    makeMove(random,"RK");
}

function checkWinner(){

    let winner = null;

    winPatterns.forEach(pattern=>{

        const [a,b,c] = pattern;

        if(
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ){
            winner = board[a];
        }

    });

    if(winner){

        gameActive = false;

        statusText.innerHTML =
            winner + " Wins";

        if(winner === "KH"){
            khScore++;
            khScoreText.innerHTML = khScore;
        }else{
            rkScore++;
            rkScoreText.innerHTML = rkScore;
        }

        return;
    }

    if(!board.includes("")){

        gameActive = false;

        drawScore++;

        drawScoreText.innerHTML = drawScore;

        statusText.innerHTML = "Draw";
    }
}

restartBtn.onclick = restartGame;

function restartGame(){

    board = ["","","","","","","","",""];

    gameActive = true;

    currentPlayer = "KH";

    statusText.innerHTML = "KH Turn";

    cells.forEach(cell=>{

        cell.innerHTML = "";

        cell.classList.remove("kh");
        cell.classList.remove("rk");

    });
}
