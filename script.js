const cells = document.querySelectorAll(".cell");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const gameDiv = document.getElementById("game");
const pvpBtn = document.getElementById("pvpBtn");
const botBtn = document.getElementById("botBtn");
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let boardState = Array(9).fill("");
let currentPlayer = "X";
let gameActive = true;
let gameMode = "pvp";
const winConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];
let confettiParticles = [];

// Menu
pvpBtn.onclick = () => startGame("pvp");
botBtn.onclick = () => startGame("bot");
menuBtn.onclick = returnToMenu;

function startGame(mode){
  gameMode = mode;
  menu.classList.add("hidden");
  gameDiv.classList.remove("hidden");
  restartGame();
}

function returnToMenu(){
  gameDiv.classList.add("hidden");
  menu.classList.remove("hidden");
}

// Click
cells.forEach(c => c.addEventListener("click", handleCellClick));
restartBtn.onclick = restartGame;

function handleCellClick(e){
  const i = e.target.dataset.index;
  if(boardState[i] || !gameActive) return;
  makeMove(i, currentPlayer);
  if(gameMode==="bot" && currentPlayer==="O" && gameActive) setTimeout(botMove, 300);
}

function makeMove(i, player){
  boardState[i] = player;
  const cell = document.querySelector(`.cell[data-index='${i}']`);
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  checkWinner();
  currentPlayer = currentPlayer==="X"?"O":"X";
  if(gameActive) message.textContent = `Player ${currentPlayer}'s turn`;
}

// Bot
function botMove(){
  const move = getBestMove();
  makeMove(move, "O");
}
function getBestMove(){
  let best=-Infinity, move;
  for(let i=0;i<9;i++){
    if(!boardState[i]){
      boardState[i]="O";
      let score=minimax(boardState,0,false);
      boardState[i]="";
      if(score>best){ best=score; move=i; }
    }
  }
  return move;
}
function minimax(arr,depth,isMax){
  let result=checkWinnerMinimax(arr);
  if(result!==null) return result;
  if(isMax){
    let best=-Infinity;
    for(let i=0;i<9;i++){
      if(!arr[i]){ arr[i]="O"; best=Math.max(best,minimax(arr,depth+1,false)); arr[i]=""; }
    }
    return best;
  }else{
    let best=Infinity;
    for(let i=0;i<9;i++){
      if(!arr[i]){ arr[i]="X"; best=Math.min(best,minimax(arr,depth+1,true)); arr[i]=""; }
    }
    return best;
  }
}
function checkWinnerMinimax(arr){
  for(const [a,b,c] of winConditions){
    if(arr[a] && arr[a]===arr[b] && arr[a]===arr[c]) return arr[a]==="O"?10:-10;
  }
  if(!arr.includes("")) return 0;
  return null;
}

// Check winner
function checkWinner(){
  let won=false;
  for(const [a,b,c] of winConditions){
    if(boardState[a] && boardState[a]===boardState[b] && boardState[a]===boardState[c]){
      won=true; break;
    }
  }
  if(won){ message.textContent=`Player ${currentPlayer} wins! 🎉`; gameActive=false; launchConfetti(); return; }
  if(!boardState.includes("")){ message.textContent="It's a draw! 🤝"; gameActive=false; }
}

// Restart
function restartGame(){
  boardState.fill("");
  cells.forEach(c=>{ c.textContent=""; c.classList.remove("x","o"); });
  currentPlayer="X";
  gameActive=true;
  message.textContent=`Player ${currentPlayer}'s turn`;
}

// Confetti
function launchConfetti(){
  confettiParticles=[];
  for(let i=0;i<150;i++){
    confettiParticles.push({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height-50,
      r:Math.random()*6+2,
      d:Math.random()*50+10,
      color:`hsl(${Math.random()*360},100%,50%)`,
      tilt:Math.random()*10-10,
      tiltAngleIncrement:Math.random()*0.07+0.05
    });
  }
  animateConfetti();
}

function animateConfetti(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  confettiParticles.forEach(p=>{
    ctx.beginPath();
    ctx.lineWidth=p.r/2;
    ctx.strokeStyle=p.color;
    ctx.moveTo(p.x+p.tilt+p.r/4,p.y);
    ctx.lineTo(p.x+p.tilt,p.y+p.tilt+p.r/2);
    ctx.stroke();
    p.tilt += p.tiltAngleIncrement;
    p.y += (Math.cos(p.d)+3+p.r/2)/2;
    if(p.y>canvas.height){p.y=-10;p.x=Math.random()*canvas.width;}
  });
  if(confettiParticles.length>0) requestAnimationFrame(animateConfetti);
}

