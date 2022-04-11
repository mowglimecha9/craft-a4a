const GRID_WIDTH = 10;
const GRID_HEIGHT = 10;
const MAX_TRIES = 30;
const VER = "vertical";
const HOR = "horizontal";
const SQUARE = "square"
let currentShipDrag = {}
let currentPlayer = 1
let feedback = document.querySelectorAll("#feedback")[0];
let blocker = document.querySelectorAll(".blocker")[0];
let stats = document.querySelectorAll(".stats")[0];
let feedbackLoop = document.querySelectorAll("#feedback-loop")[0];



let playersBoard = {
    player1:{
        vertical: {
            v4:[],
            v3:[],
            v2:[]
        },
        horizontal:{
            h4:[],
            h3:[],
            h2:[]
        },
        square:{
            s1:[],
        },
        occupied:[],
        triesCount:0,
        tries:[],
        hits:[],
        misses:[],
        correctHits:0
    },
    player2: {
        vertical: {
            v4:[],
            v3:[],
            v2:[]
        },
        horizontal:{
            h4:[],
            h3:[],
            h2:[]
        },
        square:{
            s1:[],
        },
        occupied:[],
        triesCount:0,
        tries:[],
        hits:[],
        misses:[],
        correctHits:0

    }
}

init();

function init() {
    build_battlefield()
}

function build_battlefield() {
    let battlefield = document.createElement('div');
    battlefield.id = "battleField";
    battlefield.classList.add('battleField')
    document.querySelectorAll('#main')[0].append(battlefield);
    generate_grids()
    
}

function generate_grids() {
    let battleField = document.querySelectorAll("#battleField")[0];
    let grid_container;

    for (let gh = 1; gh <= GRID_HEIGHT; gh++) {
       grid_container = document.createElement('div');
       grid_container.id = `grid-row-${gh}`;
       grid_container.classList.add('grid_row');
       battleField.append(grid_container)  
       let grid_row = document.querySelectorAll(`#grid-row-${gh}`);
        
       for (let a = 1; a <= GRID_WIDTH; a++) {
            let grid = document.createElement('div');
            grid.id = `grid-data-${a}-${gh}`

            grid.classList.add('grid');
            let gp = {x:a,y:gh}
            grid.addEventListener('click',(e) => {
                e.preventDefault()
                hitGrid(gp);
            },false)
            grid.addEventListener('dragover',(e) => {
                e.preventDefault();
            },false)
            grid.addEventListener('drop',(e)=> {
                e.preventDefault();
                let gridPosition =  {
                    x:a,
                    y:gh
                };
               if(grid_checker(currentShipDrag.length,currentShipDrag.orientation,gridPosition)) {
                    if(currentShipDrag.orientation == VER) {
                        for (let index = 0; index < currentShipDrag.length; index++) {
                            let newGp = {
                                x:a,
                                y:gridPosition.y - index
                            }
                            playersBoard[`player${currentPlayer}`][VER][`v${currentShipDrag.length}`].push(newGp) 
                            playersBoard[`player${currentPlayer}`]['occupied'].push(`g-${newGp.x}-${newGp.y}`)
                        }
                    }
                    if(currentShipDrag.orientation == HOR) {
                        for (let index = 0; index < currentShipDrag.length; index++) {
                            let newGp = {
                                x:gridPosition.x - index,
                                y:gh
                            }
                            playersBoard[`player${currentPlayer}`][HOR][`h${currentShipDrag.length}`].push(newGp) 
                            playersBoard[`player${currentPlayer}`]['occupied'].push(`g-${newGp.x}-${newGp.y}`)

                        }
                    }

                    if(currentShipDrag.orientation == SQUARE) {
                            let newGp = {
                                x:gridPosition.x,
                                y:gh
                            }
                            playersBoard[`player${currentPlayer}`][SQUARE][`s${currentShipDrag.length}`].push(newGp) 
                            playersBoard[`player${currentPlayer}`]['occupied'].push(`g-${newGp.x}-${newGp.y}`)

                        
                    }

               }
               repaintGrid();
               if(currentPlayer === 1  &&  playersBoard[`player${currentPlayer}`]['occupied'].length == 20) {
                let arr = document.querySelectorAll("#arrange")[0];
                arr.style.display = 'block'
               }
               if(currentPlayer === 2 &&  playersBoard[`player${currentPlayer}`]['occupied'].length == 20) {
                let arr = document.querySelectorAll("#arrangeP2")[0];
                arr.style.display = 'block'
               }

            },false)

            grid_container.append(grid)
        }
    }
}
function hitGrid(gp) {
    showHitsAndMiss()
    renderStats();
    let isHit = false;
    if(playersBoard.player1.occupied.length !== 20  || playersBoard.player2.occupied.length !== 20){
        alert("Please Arrange ships first!");
        return false
    } 

    if(playersBoard.player1.triesCount === MAX_TRIES  && playersBoard.player2.triesCount === MAX_TRIES){
        playersBoard.player1.correctHits > playersBoard.player2.correctHits ? alert("Player 1 Wins") : alert("Player 2 Wins")
        let winner =   playersBoard.player1.correctHits > playersBoard.player2.correctHits ? 1 : 2;
        return false
    } 
    let opponent = currentPlayer === 1 ? 2 : 1;
    let gCode = `g-${gp.x}-${gp.y}`
    if(playersBoard[`player${currentPlayer}`]['tries'].includes(gCode)) {
        alert("You have tried hitting this spot already!");
        return false
    }
    feedback.append(feedbackMessage(`Player ${currentPlayer} hit Grid ${gp.x} ${gp.y}`))
    playersBoard[`player${currentPlayer}`]['tries'].push(`g-${gp.x}-${gp.y}`)
    
    if(playersBoard[`player${opponent}`]['occupied'].includes(gCode)){
        playersBoard[`player${currentPlayer}`]['hits'].push(gp)
        playersBoard[`player${currentPlayer}`]['correctHits']+=1
        isHit = true;
        
    } else {
        playersBoard[`player${currentPlayer}`]['misses'].push(gp)
    }
    resetBoard();
    showHitsAndMiss()
    renderStats();

    setTimeout(()=> {
        blocker.style.display = "flex"
        feedbackLoop.textContent = isHit ? `You have hit a Ship!` : `You missed! :D`
    },500)


}

function repaintGrid() {
    let player = currentPlayer;
    let vertKeys = Object.keys(playersBoard[`player${player}`][VER])
    let horKeys = Object.keys(playersBoard[`player${player}`][HOR])
    let sqKeys = Object.keys(playersBoard[`player${player}`][SQUARE])

    vertKeys.forEach((val) => {
      playersBoard[`player${player}`][VER][val].forEach((c)=> {
        let gridSelector =  document.querySelectorAll(`#grid-data-${c.x}-${c.y}`);
        gridSelector[0].classList.add(currentPlayer == 1 ? 'filled' : 'filledvs')
      })
    })

    horKeys.forEach((val) => {
        playersBoard[`player${player}`][HOR][val].forEach((c)=> {
          let gridSelector =  document.querySelectorAll(`#grid-data-${c.x}-${c.y}`);
          gridSelector[0].classList.add(currentPlayer == 1 ? 'filled' : 'filledvs')
        })
      })

      sqKeys.forEach((val) => {
        playersBoard[`player${player}`][SQUARE][val].forEach((c)=> {
          let gridSelector =  document.querySelectorAll(`#grid-data-${c.x}-${c.y}`);
          gridSelector[0].classList.add(currentPlayer == 1 ? 'filled' : 'filledvs')
        })
      })
}


function showHitsAndMiss() {
    let player = currentPlayer;

      playersBoard[`player${player}`]['misses'].forEach((c)=> {
        let gridSelector =  document.querySelectorAll(`#grid-data-${c.x}-${c.y}`);
        gridSelector[0].classList.add('miss')
        })
    playersBoard[`player${player}`]['hits'].forEach((c)=> {
        let gridSelector =  document.querySelectorAll(`#grid-data-${c.x}-${c.y}`);
        gridSelector[0].classList.add('hit')
    })

}


function grid_creator() {
   let grid = document.createElement('div');
   return grid;
}
// to work
function collision(shipLength,orientation,gridPos) {
    if(orientation == VER) {
      console.log(playersBoard[`player${currentPlayer}`]['occupied'])
    }
}

function grid_checker(shipLength,orientation,gridPos) {
    
    if(orientation == VER) {
        if(gridPos.y - shipLength >= 0) {
            return true;
        }
    } 
    if(orientation == HOR) {
        if(gridPos.x - shipLength >= 0) {
            return true;
        }
    } 

    
    if(orientation == SQUARE) {
        if(gridPos.x - shipLength >= 0 || gridPos.y - shipLength >= 0) {
            return true;
        }
    } 
    
    return false
}

function dragstart(e) {
   currentShipDrag.length = e.target.dataset.length
   currentShipDrag.orientation = e.target.dataset.orientation
}

function dragend(e) {
    currentShipDrag = {}
    let orientation = e.target.dataset.orientation;
    let len = e.target.dataset.length

    if(playersBoard[`player${currentPlayer}`][orientation][orientation.charAt(0)+len].length){
        e.target.draggable = false
        e.target.style.opacity  = 0.4
    }
}

function resetBoard() {
    let  grids = document.querySelectorAll(".grid");
    grids.forEach((value)=> {
        value.classList.remove('filled','filledvs','hit','miss')
    })
    let  ships = document.querySelectorAll(".ship");
    ships.forEach((value)=> {
        value.draggable = true;
        value.style.opacity =1 
        value.classList.add('shipvs');
    })

    stats.innerHTML = ""
}

function turn() {
    playersBoard[`player${currentPlayer}`]['triesCount']+=1
    currentPlayer = currentPlayer == 2 ? 1 :2;
    blocker.style.display = "none"
    resetBoard();
    showHitsAndMiss();
    renderStats();


}


function feedbackMessage(message) {
    let p  = document.createElement('p');
    p.innerHTML = message;
    return p;
}


// Game mechanics 

function startGame() {
    let ng = document.querySelectorAll("#ng")[0];
    ng.disabled =true
    feedback.append(feedbackMessage("Starting New Game . . ."))
    feedback.append(feedbackMessage(`<strong>Player ${currentPlayer}, please start arranging ships</strong>`))
   


}

function doneArrange(){
    let arr = document.querySelectorAll("#arrange")[0];
    feedback.append(feedbackMessage(`<strong>Player ${currentPlayer} finished arranging ships</strong>`))
    currentPlayer = 2;

    feedback.append(feedbackMessage(`<strong>Player ${currentPlayer}, please start arranging ships</strong>`))
    resetBoard();

    arr.style.display="none"
}


function doneArrangep2(){
    let arr = document.querySelectorAll("#arrangeP2")[0];
    let sl = document.querySelectorAll(".ship-line");
    sl.forEach(value => value.style.display = 'none')
    feedback.append(feedbackMessage(`<strong>Player ${currentPlayer} finished arranging ships</strong>`))
    currentPlayer = 1;

    feedback.append(feedbackMessage(`<strong>Player ${currentPlayer}'s turn to hit ships, </strong>`))
    resetBoard();
    showHitsAndMiss();
    renderStats();

    arr.style.display="none"
}

function renderGrid(player) { 
    
}

function renderStats() {
    let score = playersBoard[`player${currentPlayer}`].correctHits * 100;
    stats.innerHTML =
    `
    <h3>PLAYER ${currentPlayer} TURN</h3>
    <p>Player ${currentPlayer} Statistics:</p>
    <p>Tries : ${playersBoard[`player${currentPlayer}`].triesCount} / ${MAX_TRIES}</p>
    <p>Hit Count : ${playersBoard[`player${currentPlayer}`].correctHits} </p>
    <p>Misses : ${playersBoard[`player${currentPlayer}`].misses.length} </p>
    <p>Score : ${score} </p>`
}