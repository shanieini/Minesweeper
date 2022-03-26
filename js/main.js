'use strict'
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

var gStartInt;
var gStartTime;
var gFirstClick = true;
var gNumLives = 3;

// model
var gLevel = { SIZE: 4, MINES: 2 };
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 };
var gBoard;

function init() {
    gNumLives = 3;
    renderLives();
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gBoard = createBoard(gLevel.SIZE);
    renderMines();
    renderBoard(gBoard);
}

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

function getCellRender(cell) {
    if (cell.isShown) {
        return cell.isMine ? MINE : (cell.minesAroundCount === 0 ? EMPTY : cell.minesAroundCount);
    } else if (cell.isMarked) {
        return FLAG;
    } else {
        return EMPTY;
    }
}

function getElementsFromLocation(i, j) {
    return document.querySelector(`.cell-${i}-${j}`);
}

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
}

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

function createTimer() {
    if (gFirstClick) {
        var currTime = new Date();
        gStartTime = currTime.getTime();
        gStartInt = setInterval(timer, 100);
    }
    gFirstClick = false;
}

function endOfTheGame() {
    clearInterval(gStartInt);
    showAllCells();
    gFirstClick = true;
    renderBoard(gBoard);
}

function cellClicked(i, j) {
    var currCell = gBoard[i][j];
    if (currCell.isShown) return;
    CLICK_SOUND.play();
    createTimer();
    currCell.isShown = true;
    if (currCell.isMine) {
        removeLive();

    } else {
        gGame.shownCount++;
        console.log('left click: ', gGame.shownCount);
        if (currCell.minesAroundCount === 0) {
            openEmptyCells(i, j);

        }
    }

    var isLose = checkGameOver();
    if (isLose) {
        var elSmile = document.querySelector('.smile');
        elSmile.innerText = SAD_FACE;
        OVER_SOUND.play();
        endOfTheGame();
    }

    var isWin = checkIsVictory();
    if (isWin) {
        var elSmile = document.querySelector('.smile');
        elSmile.innerText = COOL_FACE;
        WIN_SOUND.play();
        endOfTheGame();
    }
    renderBoard(gBoard);
}

function cellRightClicked(i, j) {
    window.event.preventDefault();
    var currCell = gBoard[i][j];
    if (currCell.isShown) return;
    createTimer();
    if (currCell.isMarked) {
        currCell.isMarked = false;
        gGame.markedCount--;
    } else {
        currCell.isMarked = true;
        gGame.markedCount++;
    }
    var isWin = checkIsVictory();
    if (isWin) {
        var elSmile = document.querySelector('.smile');
        elSmile.innerText = COOL_FACE;
        WIN_SOUND.play();
        endOfTheGame();
    }
    renderBoard(gBoard);
}

function renderMines() {
    for (let i = 0; i < gLevel.MINES; i++) {
        var iRnd = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var jRnd = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var currCell = gBoard[iRnd][jRnd];
        currCell.isMine = true;
    }
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function timer() {
    var currTime = new Date();
    var time = currTime.getTime();
    var timeOnScreen = (time - gStartTime) / 1000;
    var elTime = document.querySelector('.time');
    elTime.innerText = `${timeOnScreen}`;
}

function checkGameOver() {
    return gNumLives === 0
}

function showAllCells() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].isShown = true;
        }
    }
}

function checkIsVictory() {
    var mineIndicate = gGame.markedCount + (3 - gNumLives);
    var boardSize = gLevel.SIZE * gLevel.SIZE;
    console.log('boardSize: ', boardSize);
    console.log('gGame.markedCount: ', gGame.markedCount);
    console.log('safe: ', (3 - gNumLives));
    console.log('gGame.shownCoun: ', gGame.shownCount);
    if (boardSize === gGame.shownCount + mineIndicate) {
        return true;
    }
    return false;
}

function playAgain() {
    var elSmile = document.querySelector('.smile');
    elSmile.innerText = HAPPY_FACE;
    gFirstClick = true;
    clearInterval(gStartInt)
    var elTime = document.querySelector('.time');
    elTime.innerText = 'Time';
    init()
}

function pressBtn(num, mines) {
    var elSmile = document.querySelector('.smile');
    elSmile.innerText = HAPPY_FACE;
    gFirstClick = true;
    clearInterval(gStartInt)
    var elTime = document.querySelector('.time');
    elTime.innerText = 'Time';
    gLevel.SIZE = num;
    gLevel.MINES = mines
    init();
}

function removeLive() {
    // model:
    gNumLives--;
    //DOM:
    renderLives();
}

function renderLives() {
    var strHtml = '';
    for (var i = 0; i < gNumLives; i++) {
        strHtml += LIFE;
    }
    var elLives = document.querySelector('.lives');
    elLives.innerText = strHtml;
}

function openEmptyCells(cellI, cellJ) {
    // model:
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            if (gBoard[i][j].isShown === false) {
                gBoard[i][j].isShown = true;
                gGame.shownCount++;
                console.log('i: ', i);
                console.log('j: ', j);
                console.log('gGame.showncount At Empty Cell: ', gGame.shownCount);
            }
        }
    }
    // DOM:
    renderBoard(gBoard);
}


