/*
Minesweeper, JavaScript
	Author:		Michael Mroczka, Max Petretta
	Date:		December 17, 2016
	Class:		CIS 435-001
	Purpose:	JavaScript file for game scripting, user interaction, and win condition checking
	Notes:		None
*/


//Global variables
var seconds = 0;
var flagCount = 0;
var timer;

var numberOfRows = 9;
var numberOfCols = 9;
var numberOfMines = 10;

var mines = [];
var flags = [];
var flipped = [];

//Cell images
var numberOneCellImage = '<img src="img/1_cell.png" alt="Number 1 cell">';
var numberTwoCellImage = '<img src="img/2_cell.png" alt="Number 2 cell">';
var numberThreeCellImage = '<img src="img/3_cell.png" alt="Number 3 cell">';
var numberFourCellImage = '<img src="img/4_cell.png" alt="Number 4 cell">';
var numberFiveCellImage = '<img src="img/5_cell.png" alt="Number 5 cell">';
var numberSixCellImage = '<img src="img/6_cell.png" alt="Number 6 cell">';
var numberSevenCellImage = '<img src="img/7_cell.png" alt="Number 7 cell">';
var numberEightCellImage = '<img src="img/8_cell.png" alt="Number 8 cell">';

var hiddenCellImage = '<img src="img/hidden_cell.png" alt="Hidden cell">';
var emptyCellImage = '<img src="img/empty_cell.png" alt="Empty cell">';
var flagCellImage = '<img src="img/flag_cell.png" alt="Flag cell">';
var mineExplosionCellImage = '<img src="img/mine_explosion_cell.png" alt="Explosion cell">';
var mineCellImage = '<img src="img/mine_cell.png" alt="Mine cell">';

//ID variable
var $ = function(id) {
	return document.getElementById(id);
};


//Sets up the difficulty selection buttons
function gameSetup() {
	$('easy_game_button').addEventListener("click", easyGameButton);
	$('intermediate_game_button').addEventListener("click", intermediateGameButton);
	$('advanced_game_button').addEventListener("click", advancedGameButton);
	easyGameButton();
} //gameSetup()


//Initializes game boards variables based on difficulty, and resets flag & time counters
function buildGame(r, c, m) {
	//Initialize variables
	numberOfRows = r;
	numberOfCols = c;
	numberOfMines = m;
	flagCount = numberOfMines;
	flags = [];
	flipped = [];
	mines = [];

	//Reset board & counters
	setMines();
	initBoard();
	resetTimer();
	resetFlags();
} //buildGame()


//Adds a flag cell where the user has right-clicked, and checks if the game is finished
function toggleFlag(clickedCell) {
	//Initialize variables
	var clickedCellNumber = parseInt(clickedCell.split("_").pop());
	var contents = $('cell_' + clickedCellNumber).innerHTML;

	//Revert a flag selection
	if(contents == String(flagCellImage)) {
		$('cell_' + clickedCellNumber).innerHTML = hiddenCellImage;
		flagCount += 1;
		var flagToRemove = flags.indexOf(clickedCellNumber);
		flags.splice(flagToRemove, 1);
		$('flags').innerHTML = flagCount;
	}

	//Add a flag cell
	else {
		$('cell_' + clickedCellNumber).innerHTML = flagCellImage;
		flagCount -= 1;
		flags.push(clickedCellNumber);
		$('flags').innerHTML = flagCount;

		//Check if the game is complete
		if(isGameFinished()) {
			stopTimer();
			alert("Game completed. You win! Only took you " + seconds + " seconds!");
		}
		// console.log("Game not finished");
	}
	return false;
} //toggleFlag()


//Checks if flags are correctly placed by examining mine array
function isGameFinished() {
	if(flagCount == 0) {
		for(var i = 0; i < mines.length; i++) {
			if(flags.indexOf(mines[i]) == -1) {
				return false;
			}
		}
		return true;
	}
	return false;
} //isGameFinished()


//Randomly places mines in game board
function setMines() {
	//Initialize variables
	max = (numberOfRows*numberOfCols)-1;
	min = 0;

	// keeping adding mines to the array until you have all the mines you need
	for(var i = 0; i < numberOfMines; i++) {
		// keep getting a new randomIndex until you find one
		// that isn't in the mine array
		do {
			randomIndex = Math.floor(Math.random() * (max - min + 1)) + min;
		}
		while(isInMineArray(randomIndex) != -1);
		// add to the mine array
		mines.push(randomIndex);
	}
	// below was used to debug and be sure numbers were in acceptable ranges
	// for(var i = 0; i < mines.length; i++) {
	// 	console.log(mines[i]);
	// }
} //setMines()


//Show all mines to the user if they have lost
function showMines() {
	for(var i = 0; i < mines.length; i++) {
		var cellNumber = mines[i];
		$('cell_' + cellNumber).innerHTML = mineCellImage;
	}
} //showMines()


//Returns if a mine is already at the current location
function isInMineArray(number) {
	return mines.indexOf(number);
} //isInMineArray()


//Creates the game board HTML
function initBoard() {
	resetFlags();
	stopTimer();
	startTimer();

	var content = '';
	content += '<table>'
	var arrayIndexToGet = 0;
	for (var i = 0; i < numberOfRows; ++i) {
		content += '<tr>';
		for (var j = 0; j < numberOfCols; ++j) {
			content += '<td id=\"cell_' + arrayIndexToGet + '\" onclick=\"userClick(this.id)\" oncontextmenu=\"toggleFlag(this.id); return false;\">';
			content += hiddenCellImage;
			++arrayIndexToGet;
			content += '</td>';
		}
		content += '</tr>';
	}
	$('game').innerHTML = content;
} //initBoard()


//Checks if the user has clicked a mine, and otherwise performs floodfill
function userClick(clickedCell) {
	var clickedCellNumber = parseInt(clickedCell.split("_").pop());
	if(mines.indexOf(clickedCellNumber) != -1) {
		showMines();
		$('cell_' + clickedCellNumber).innerHTML = mineExplosionCellImage;
		alert("You hit a mine! Game Over!");
		stopTimer();
	}
	else {
		floodfill(clickedCellNumber);
	}
} //userClick()


//Performs minesweeper floodfill, and adds number images to cells adjacent to mines
function floodfill(clickedCell) {
	//Initialize variables
	var neighbors = getNeighbors(clickedCell);
	var bombCount = countBombsAroundCell(neighbors);

	if(bombCount > 0) {
		// set the cell equal to a number and stop calling floodfill on that cell
		if(bombCount == 1) {
			$('cell_' + clickedCell).innerHTML = numberOneCellImage;
		}
		else if(bombCount == 2) {
			$('cell_' + clickedCell).innerHTML = numberTwoCellImage;
		}
		else if(bombCount == 3) {
			$('cell_' + clickedCell).innerHTML = numberThreeCellImage;
		}
		else if(bombCount == 4) {
			$('cell_' + clickedCell).innerHTML = numberFourCellImage;
		}
		else if(bombCount == 5) {
			$('cell_' + clickedCell).innerHTML = numberFiveCellImage;
		}
		else if(bombCount == 6) {
			$('cell_' + clickedCell).innerHTML = numberSixCellImage;
		}
		else if(bombCount == 7) {
			$('cell_' + clickedCell).innerHTML = numberSevenCellImage;
		}
		else if(bombCount == 8) {
			$('cell_' + clickedCell).innerHTML = numberEightCellImage;
		}
		else {
			alert("Something went seriously wrong if this ever gets seen!");
			$('cell_' + clickedCell).innerHTML = "X";
		}
	}
	else if(bombCount == 0 && flipped.indexOf(clickedCell) == -1 && flags.indexOf(clickedCell) == -1) {
		$('cell_' + clickedCell).innerHTML = emptyCellImage;
		flipped.push(clickedCell);
		for(var i = 0; i < neighbors.length; i++) {
			floodfill(neighbors[i]);
		}
	}
} //floodfill()


//Checks the surrounding cells for mines
function getNeighbors(clickedCellNumber) {
	//Initialize variables
	var neighbors = [];
	var top, bottom, left, right, topLeft, topRight, bottomLeft, bottomRight;

	//Check directly adjacent cells
	if(clickedCellNumber >= numberOfCols) {
		// cell has a top neighbor, so add to neighbors
		top = clickedCellNumber - numberOfCols;
		neighbors.push(top);
	}
	if(clickedCellNumber <= (numberOfCols*numberOfRows-1)-numberOfCols) {
		// cell has a bottom neighbor, so add to neighbors
		bottom = clickedCellNumber + numberOfCols;
		neighbors.push(bottom);
	}
	if((clickedCellNumber % numberOfCols) !== (numberOfCols-1)) {
		// cell has a right neighbor, so add to neighbors
		right = clickedCellNumber + 1;
		neighbors.push(right);
	}
	if((clickedCellNumber % numberOfCols) !== 0) {
		// cell has a right neighbor, so add to neighbors
		left = clickedCellNumber - 1;
		neighbors.push(left);
	}

	//Check diagonally adjacent cells
	if(!isNaN(left)) {
		if(!isNaN(top)) {
			topLeft = top-1;
			neighbors.push(topLeft);
		}
		if(!isNaN(bottom)) {
			bottomLeft = bottom-1;
			neighbors.push(bottomLeft);
		}
	}
	if(!isNaN(right)) {
		if(!isNaN(top)) {
			topRight = top + 1;
			neighbors.push(topRight);
		}
		if(!isNaN(bottom)) {
			bottomRight = bottom + 1;
			neighbors.push(bottomRight);
		}
	}

	return neighbors;
} //getNeighbors()


//Counts mines by iterating over the neighbors array
function countBombsAroundCell(neighbors) {
	//Initialize variables
	var bombCount = 0;

	for(var i = 0; i < neighbors.length; i++) {
		// looks in mine array and if the neighbor is in the array, then add one to bombCount
		if(mines.indexOf(neighbors[i]) != -1) {
			bombCount+=1;
		}
	}
	return bombCount;
} //countBombsAroundCell()


//Helper functions
function easyGameButton() {
	buildGame(9, 9, 10);
}

function intermediateGameButton() {
	buildGame(16, 16, 40);
}

function advancedGameButton() {
	buildGame(16, 20, 99);
}

function resetFlags() {
	flagCount = mines.length;
	$('flags').innerHTML = flagCount;
}

function resetTimer() {
	seconds = 0;
	$("secondsSoFar").innerHTML = seconds;
}

function startTimer() {
	timer = window.setInterval("updateTimer()", 1000);
};

function stopTimer() {
	clearInterval(timer);
}

function updateTimer() {
	++seconds;
	$("secondsSoFar").innerHTML = seconds;
};


//Activate script file & timer
window.addEventListener("load", startTimer, false);
window.addEventListener("load", gameSetup, false);
