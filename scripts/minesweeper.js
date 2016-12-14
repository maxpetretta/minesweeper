var seconds = 0;
var flagCount = 0;
var timer;

var numberOfRows = 9;
var numberOfCols = 9;
var numberOfMines = 10;

var mines = [];
var flags = [];
var flipped = [];

var hiddenCellImage = '<img src="img/hidden_cell.png" alt="">';
var emptyCellImage = '<img src="img/empty_cell.png" alt="">';
var numberOneCellImage = '<img src="img/1_cell.png" alt="">';
var numberTwoCellImage = '<img src="img/2_cell.png" alt="">';
var numberThreeCellImage = '<img src="img/3_cell.png" alt="">';
var flagCellImage = '<img src="img/flag_cell.png" alt="">';
var mineExplosionCellImage = '<img src="img/mine_explosion_cell.png" alt="">';
var mineCellImage = '<img src="img/mine_cell.png" alt="">';

var $ = function(id) {
	return document.getElementById(id);
};

function gameSetup(){
	$('easy_game_button').addEventListener("click", easyGameButton);
	$('intermediate_game_button').addEventListener("click", intermediateGameButton);
	$('advanced_game_button').addEventListener("click", advancedGameButton);
	easyGameButton();
}

function easyGameButton(){
	buildGame(9, 9, 10);
}

function intermediateGameButton(){
	buildGame(16, 16, 40);
}

function advancedGameButton(){
	buildGame(16, 20, 99);
}

function buildGame(r, c, m){
	numberOfRows = r;
	numberOfCols = c;
	numberOfMines = m;
	flagCount = numberOfMines;
	flags = [];
	flipped = [];
	mines = [];
	setMines();
	initBoard();
	resetTimer();
	resetFlags();
}

function toggleFlag(clickedCell){
	var clickedCellNumber = parseInt(clickedCell.split("_").pop());
	var contents = $('cell_' + clickedCellNumber).innerHTML;
	if(contents == String(flagCellImage)){
		$('cell_' + clickedCellNumber).innerHTML = hiddenCellImage;
		flagCount += 1;
		var flagToRemove = flags.indexOf(clickedCellNumber);
		flags.splice(flagToRemove, 1);
		$('flags').innerHTML = flagCount;
	}
	else{
		$('cell_' + clickedCellNumber).innerHTML = flagCellImage;
		flagCount -= 1;
		flags.push(clickedCellNumber);
		$('flags').innerHTML = flagCount;
		if(isGameFinished()){
			stopTimer();
			alert("Game completed. You win! Only took you " + seconds + " seconds!");
		}
		// console.log("Game not finished");
	}
	return false;
}

function isGameFinished(){
	if (flagCount == mines.length){
		for(var i = 0; i < mines.length; i++){
			if(flags.indexOf(mines[i]) == -1){
				return false;
			}
		}
		return true;
	}
	return false;
}

function setMines(){
	max = (numberOfRows*numberOfCols)-1;
	min = 0;

	// keeping adding mines to the array until you have all the mines you need
	for(var i = 0; i < numberOfMines; i++){
		// keep getting a new randomIndex until you find one
		// that isn't in the mine array
		do{
			randomIndex = Math.floor(Math.random() * (max - min + 1)) + min;
		}
		while(isInMineArray(randomIndex) != -1);
		// add to the mine array
		mines.push(randomIndex);
	}
	// below was used to debug and be sure numbers were in acceptable ranges
	// for(var i = 0; i < mines.length; i++){
	// 	console.log(mines[i]);
	// }
}

function showMines(){
	for(var i = 0; i < mines.length; i++){
		var cellNumber = mines[i];
		$('cell_' + cellNumber).innerHTML = mineCellImage;
	}
}

function isInMineArray(number){
	return mines.indexOf(number);
}

function initBoard(){
	resetFlags();
	stopTimer();
	startTimer();

	var content = '';
	content += '<table>'
	var arrayIndexToGet = 0;
	for (var i = 0; i < numberOfRows; ++i){
		content += '<tr>';
		for (var j = 0; j < numberOfCols; ++j){
			content += '<td id=\"cell_' + arrayIndexToGet + '\" onclick=\"userClick(this.id)\" oncontextmenu=\"toggleFlag(this.id); return false;\">';
			content += hiddenCellImage;
			++arrayIndexToGet;
			content += '</td>';
		}
		content += '</tr>';
	}
	$('game').innerHTML = content;
}

function userClick(clickedCell){
	var clickedCellNumber = parseInt(clickedCell.split("_").pop());
	if(mines.indexOf(clickedCellNumber) != -1){
		showMines();
		$('cell_' + clickedCellNumber).innerHTML = mineExplosionCellImage;
		alert("You hit a mine! Game Over!");
		stopTimer();
	}
	else{
		floodfill(clickedCellNumber);
	}
}

function floodfill(clickedCell){
	var neighbors = getNeighbors(clickedCell);
	var bombCount = countBombsAroundCell(neighbors);
	if(bombCount > 0){
		// set the cell equal to a number and stop calling floodfill on that cell
		if(bombCount == 1){
			$('cell_' + clickedCell).innerHTML = numberOneCellImage;
		}
		else if(bombCount == 2){
			$('cell_' + clickedCell).innerHTML = numberTwoCellImage;
		}
		else if(bombCount == 3){
			$('cell_' + clickedCell).innerHTML = numberThreeCellImage;
		}
		else{
			alert("something went seriously wrong if this every gets seen!");
			$('cell_' + clickedCell).innerHTML = "X";
		}
	}
	else if(bombCount == 0 && flipped.indexOf(clickedCell) == -1 && flags.indexOf(clickedCell) == -1){
		$('cell_' + clickedCell).innerHTML = emptyCellImage;
		flipped.push(clickedCell);
		for(var i = 0; i < neighbors.length; i++){
			floodfill(neighbors[i]);
		}
	}
}

function getNeighbors(clickedCellNumber){
	var neighbors = [];
	var top, bottom, left, right, topLeft, topRight, bottomLeft, bottomRight;

	if(clickedCellNumber >= numberOfCols){
		// cell has a top neighbor, so add to neighbors
		top = clickedCellNumber - numberOfCols;
		neighbors.push(top);
	}
	if(clickedCellNumber <= (numberOfCols*numberOfRows-1)-numberOfCols){
		// cell has a bottom neighbor, so add to neighbors
		bottom = clickedCellNumber + numberOfCols;
		neighbors.push(bottom);
	}
	if((clickedCellNumber % numberOfCols) !== (numberOfCols-1)){
		// cell has a right neighbor, so add to neighbors
		right = clickedCellNumber + 1;
		neighbors.push(right);
	}

	if((clickedCellNumber % numberOfCols) !== 0){
		// cell has a right neighbor, so add to neighbors
		left = clickedCellNumber - 1;
		neighbors.push(left);
	}

	if(!isNaN(left)){
		if(!isNaN(top)){
			topLeft = top-1;
		}
		if(!isNaN(bottom)){
			bottomLeft = bottom-1;
		}
	}

	if(!isNaN(right)){
		if(!isNaN(top)){
			topRight = top + 1;
		}
		if(!isNaN(bottom)){
			bottomRight = bottom + 1;
		}
	}

	return neighbors;
}

function countBombsAroundCell(neighbors){
	var bombCount = 0;
	for(var i = 0; i < neighbors.length; i++){
		// looks in mine array and if the neighbor is in the array, then add one to bombCount
		if(mines.indexOf(neighbors[i]) != -1){
			bombCount+=1;
		}
	}
	return bombCount;
}

/*HELPER FUNCTIONS*/

function resetFlags(){
	flagCount = mines.length;
	$('flags').innerHTML = flagCount;
}

function resetTimer(){
	seconds = 0;
}

function startTimer() {
	timer = window.setInterval("updateTimer()", 1000);
};

function stopTimer(){
	clearInterval(timer);
}

function updateTimer() {
	++seconds;
	$("secondsSoFar").innerHTML = seconds;
};

window.addEventListener("load", startTimer, false);
window.addEventListener("load", gameSetup, false);
