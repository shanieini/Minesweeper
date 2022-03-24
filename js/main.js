'use strict'
// אייקונים
const MINE = '💣';
const FLAG = '🚩';
const HAPPY_FACE = '🙂';
const SAD_FACE = '☹️';
const COOL_FACE = '😎';
const LIFE = '❤️';
const EMPTY = '';
const WIN_SOUND = new Audio('sound/win.wav');
const CLICK_SOUND = new Audio('sound/click.wav');
const OVER_SOUND = new Audio('sound/over.wav');

// גלובליים
var gStartInt;
var gStartTime;
var gFirstClick = true;
var gNumLives = 3;

// model
var gLevel = { SIZE: 4, MINES: 2 };
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 };
var gBoard;

// פונקציית איתחול
function init() {
    gBoard = createBoard(gLevel.SIZE);
    renderMines();
    renderBoard(gBoard);
}


// פונקציית בניית הלוח
function createBoard(boardSize) {
    var board = [];
    for (var i = 0; i < boardSize; i++) {
        board[i] = [];
        for (var j = 0; j < boardSize; j++) {
            board[i][j] = { minesAroundCount: 0, isShown: false, isMine: false, isMarked: false }
        }
    }
    return board;
}


// פונקצייה בדיקות
function getCellRender(cell) {
    if (cell.isShown) {
        return cell.isMine ? MINE : (cell.minesAroundCount === 0 ? EMPTY : cell.minesAroundCount);
    } else if (cell.isMarked) {
        return FLAG;
    } else {
        return EMPTY;
    }
}


// מחזירה אלמנט
function getElementsFromLocation(i, j) {
    return document.querySelector(`.cell-${i}-${j}`);
}


// פונקצייה האחראית על רינדור
function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            // בודק כמה שכנים יש
            var numOfNeighbors = setMinesNegsCount(i, j, board);
            var cell = board[i][j];
            cell.minesAroundCount = numOfNeighbors;
            var isShownCell = cell.isShown;
            strHTML += `<td class="cell-${i}-${j} ${isShownCell ? 'shown' : ''}" onClick="cellClicked(${i}, ${j})" oncontextmenu="cellRightClicked(${i}, ${j})">${getCellRender(cell)}</td>`;
        }
        strHTML += '</tr>';
    }
    var elTable = document.querySelector('.board');
    elTable.innerHTML = strHTML;
    numOfLives()
}

// סופר כמה מוקשים יש מסביב לתא
function setMinesNegsCount(cellI, cellJ, board) {
    var neighborsMineCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].isMine) neighborsMineCount++;
        }
    }
    return neighborsMineCount;
}

// פונקצייה שמפעילה את הטיימר
function createTimer() {
    if (gFirstClick) {
        var currTime = new Date();
        gStartTime = currTime.getTime();
        gStartInt = setInterval(timer, 100);
    }
    gFirstClick = false;
}


// תנאים לסיום המשחק
function endOfTheGame() {
    clearInterval(gStartInt);
    showAllCells();
    renderBoard(gBoard);
}

// לחיצה על תא עם מקש שמאלי
function cellClicked(i, j) {
    CLICK_SOUND.play();
    // gGame.shownCount++
    createTimer();
    var currCell = gBoard[i][j];
    currCell.isShown = true;
    if (currCell.isMine) {
        gNumLives--
    }
    renderBoard(gBoard);
    // תנאי הפסד
    var isLose = checkGameOver();
    if (isLose) {
        var elSmile = document.querySelector('.smile');
        elSmile.innerText = SAD_FACE;
        OVER_SOUND.play();
        endOfTheGame();
    }
    // תנאי ניצחון
    var isWin = checkIsVictory();
    if (isWin) {
        var elSmile = document.querySelector('.smile');
        elSmile.innerText = COOL_FACE;
        WIN_SOUND.play();
        endOfTheGame();
    }
}

// לחיצה על תא מקש ימני
function cellRightClicked(i, j) {
    window.event.preventDefault();
    createTimer();
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isShown = false;
        // gGame.markedCount++
    }
    renderBoard(gBoard);
}

// פונקציה שמרנדרת מוקשים במקום רנדומלי
function renderMines() {
    for (let i = 0; i < gLevel.MINES; i++) {
        var iRnd = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var jRnd = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var currCell = gBoard[iRnd][jRnd];
        currCell.isMine = true;
    }
}

// פונקציה מובנית
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// אחראית על טיימר
function timer() {
    var currTime = new Date();
    var time = currTime.getTime();
    var timeOnScreen = (time - gStartTime) / 1000;
    var elTime = document.querySelector('.time');
    elTime.innerText = `${timeOnScreen}`;
}

// בודק אם יש הפסד
function checkGameOver() {
    return gNumLives === 0;
}

// חושף את כל התאים
function showAllCells() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].isShown = true;
        }
    }
}


// בודק אם יש ניצחון
function checkIsVictory() {
    var allMarkedOrShow = true;
    var markedCounter = 0;
    var mineCounter = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j];
            if (!currCell.isMarked && !currCell.isShown) {
                allMarkedOrShow = false;
            }
            if (!currCell.isShown) {
                allMarkedOrShow = false
            }
            if (currCell.isMine) {
                mineCounter++;
            }
            if (currCell.isMarked) {
                markedCounter++;
            }
        }
    }
    if (markedCounter + mineCounter !== gLevel.MINES || mineCounter > 2) {
        allMarkedOrShow = false;
    }
    return allMarkedOrShow;
}
// (>2 mines) + ()

// לשחק שוב
function playAgain() {
    var elSmile = document.querySelector('.smile');
    elSmile.innerText = HAPPY_FACE;
    init()
}


// בחירת רמות
function pressBtn(num, mines) {
    var elSmile = document.querySelector('.smile');
    elSmile.innerText = HAPPY_FACE;
    gLevel.SIZE = num;
    gLevel.MINES = mines
    init()

}


function numOfLives() {
    var live = '';
    for (var i = 0; i < gNumLives; i++) {
        live += LIFE;
    }
    var elLives = document.querySelector('.lives');
    elLives.innerText = live;
}

//  צריך לתקן את התנאי ניצחון . מראה רק ניצחון
// תיקון כפתור לשחק שוב שירנדק את החיים
// להחליף את פונקציית הטיימר

