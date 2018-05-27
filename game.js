'use strict';
var numColumns = 10;
var numRows = 6;
var playerColors = ['#ff5555', '#55ff55', '#ffcc55', '#55ccff'];
var players = [];
var inputActive = false;
var playerId = 0;
var overloaded = [];

document.addEventListener('DOMContentLoaded', function() {
	askNumberOfPlayers();
}, false);

function askNumberOfPlayers() {
	var intro = document.createElement('div');
	intro.id = 'intro';
	document.body.appendChild(intro);
	var p = document.createElement('p');
	p.appendChild(document.createTextNode('how many players?'));
	intro.appendChild(p);
	for(var i = 2; i <= 4; i++) {
		var button = document.createElement('button');
		button.appendChild(document.createTextNode(i));
		button.dataset.players = i;
		button.addEventListener('click', function() { setupGame(parseInt(this.dataset.players));});
		intro.appendChild(button);
	}
}

function setupGame(numPlayers) {
	document.body.removeChild(document.getElementById('intro'));
	var status = document.createElement('div');
	status.id = 'status';
	document.body.appendChild(status);
	overloaded = [];
	players = [];
	var board = createBoard(numColumns, numRows);
	var playerList = document.createElement('div');
	playerList.id = 'playerList';
	document.body.appendChild(playerList);
	for(var i = 0; i < numPlayers; i++) {
		var player = new Object;
		player.alive = true;
		player.turns = 0;
		player.color = playerColors[i];
		player.atoms = 0;
		players[i] = player;
		var playerIcon = document.createElement('div');
		playerIcon.className = 'player player' + i;
		playerList.appendChild(playerIcon);
	}
	document.documentElement.style.cursor = 'url("cursor-player0.svg") 18 3, default';
	inputActive = true;
}

function createBoard(numColumns, numRows) {
	var board = document.createElement('div');
	board.id = 'board';
	document.body.appendChild(board);
	for(var row = 1; row <= numRows; row++) {
		for(var column = 1; column <= numColumns; column++) {
			var cell = document.createElement('button');
			cell.id = 'cell_' + column + '_' + row;
			cell.className = 'cell';
			cell.style.gridColumn = column;
			cell.style.gridRow = row;
			cell.dataset.atoms = 0;
			if((column == 1 && row == 1) || (column == numColumns && row == 1) || (column == 1 && row == numRows) || (column == numColumns && row == numRows)) {
				cell.dataset.maxAtoms = 1;
			} else if(column == 1 || row == 1 || column == numColumns || row == numRows) {
				cell.dataset.maxAtoms = 2;
			} else {
				cell.dataset.maxAtoms = 3;
			}
			cell.dataset.playerId = -1;
			cell.addEventListener('click', function() { cellClick(this);});
			board.appendChild(cell);
		}
	}
	return board;
}

function cellClick(cell) {
	if(!inputActive) return;
	if(cell.dataset.playerId == -1 || cell.dataset.playerId == playerId) {
		inputActive = false;
		players[playerId].turns++;
		addAtom(cell, playerId, function() {
			chainReaction(function() {
				if(!inputActive) {
					inputActive = true;
					nextPlayer();
				}
			});
		});
	}
}

function nextPlayer() {
	playerId++;
	if(!players[playerId]) playerId = 0;
	document.documentElement.style.cursor = 'url("cursor-player' + playerId + '.svg") 18 3, default';
	if(!players[playerId].alive) nextPlayer();
}

function addAtom(cell, playerId, postAdd) {
	if(cell.dataset.atoms <= cell.dataset.maxAtoms) {
		if(cell.dataset.playerId != -1 && cell.dataset.playerId != playerId) {
			players[cell.dataset.playerId].atoms -= parseInt(cell.dataset.atoms);
			players[playerId].atoms += parseInt(cell.dataset.atoms);
			if(players[cell.dataset.playerId].atoms == 0) {
				players[cell.dataset.playerId].alive = false;
				document.getElementById('playerList').getElementsByClassName('player' + cell.dataset.playerId)[0].className += ' dead';
			}
		}
		cell.dataset.playerId = playerId;
		cell.dataset.atoms++;
		players[playerId].atoms++;
		if(cell.dataset.atoms > cell.dataset.maxAtoms) {
			overloaded.push(cell);
		}
	}
	drawAtoms(cell, function postDraw(e) {
		this.removeEventListener('transitionend', postDraw);
		postAdd();
	});
}

function explodeCell(cell, postAdd) {
	var explosion = document.createElement('div');
	explosion.className = 'explosion start';
	cell.appendChild(explosion);
	window.requestAnimationFrame(function() {
		window.requestAnimationFrame(function() {
			explosion.className = 'explosion end';
			explosion.addEventListener('transitionend', postExplosion);
		});
	});
	var atoms = cell.getElementsByClassName('atom');
	for(var atom; atom = atoms[0];) {
		cell.removeChild(atom);
	}
	players[cell.dataset.playerId].atoms -= parseInt(cell.dataset.atoms);
	cell.dataset.atoms = 0;
	cell.dataset.playerId = -1;
	var x = parseInt(cell.style.gridColumn, 10);
	var y = parseInt(cell.style.gridRow, 10);
	var neighbour;
	if(neighbour = document.getElementById('cell_' + (x - 1) + '_' + y)) {
		addAtom(neighbour, playerId, postAdd);
		postAdd = function(){};
	}
	if(neighbour = document.getElementById('cell_' + (x + 1) + '_' + y)) {
		addAtom(neighbour, playerId, postAdd);
		postAdd = function(){};
	}
	if(neighbour = document.getElementById('cell_' + x + '_' + (y - 1))) {
		addAtom(neighbour, playerId, postAdd);
		postAdd = function(){};
	}
	if(neighbour = document.getElementById('cell_' + x + '_' + (y + 1))) {
		addAtom(neighbour, playerId, postAdd);
		postAdd = function(){};
	}
}

function postExplosion() {
	if(this && this.parentNode) {
		this.parentNode.removeChild(this);
	}
}

function drawAtoms(cell, postTransition) {
	var newAtom = document.createElement('div');
	newAtom.addEventListener('transitionend', postTransition);
	if(cell.dataset.atoms == 1) {
		newAtom.className = 'atom atom1 player' + cell.dataset.playerId + ' pos1 size0';
		cell.appendChild(newAtom);
		window.requestAnimationFrame(function() {
			window.requestAnimationFrame(function() {
				newAtom.className = 'atom atom1 player' + cell.dataset.playerId + ' pos1';
			});
		});
	} else if(cell.dataset.atoms == 2) {
		cell.getElementsByClassName('atom1')[0].className = 'atom atom1 player' + cell.dataset.playerId + ' pos2';
		newAtom.className = 'atom atom2 player' + cell.dataset.playerId + ' pos1 size0';
		cell.appendChild(newAtom);
		window.requestAnimationFrame(function() {
			window.requestAnimationFrame(function() {
				newAtom.className = 'atom atom2 player' + cell.dataset.playerId + ' pos1';
			});
		});
	} else if(cell.dataset.atoms == 3) {
		cell.getElementsByClassName('atom1')[0].className = 'atom atom1 player' + cell.dataset.playerId + ' pos3';
		cell.getElementsByClassName('atom2')[0].className = 'atom atom2 player' + cell.dataset.playerId + ' pos2';
		newAtom.className = 'atom atom3 player' + cell.dataset.playerId + ' pos1 size0';
		cell.appendChild(newAtom);
		window.requestAnimationFrame(function() {
			window.requestAnimationFrame(function() {
				newAtom.className = 'atom atom3 player' + cell.dataset.playerId + ' pos1';
			});
		});
	} else if(cell.dataset.atoms >= 4) {
		cell.getElementsByClassName('atom1')[0].className = 'atom atom1 player' + cell.dataset.playerId + ' pos4';
		cell.getElementsByClassName('atom2')[0].className = 'atom atom2 player' + cell.dataset.playerId + ' pos3';
		cell.getElementsByClassName('atom3')[0].className = 'atom atom3 player' + cell.dataset.playerId + ' pos2';
		newAtom.className = 'atom atom4 player' + cell.dataset.playerId + ' pos1 size0';
		cell.appendChild(newAtom);
		window.requestAnimationFrame(function() {
			window.requestAnimationFrame(function() {
				newAtom.className = 'atom atom4 player' + cell.dataset.playerId + ' pos1';
			});
		});
	}
}

function chainReaction(postChain) {
	if(isGameOver()) {
		console.log('Game over!');
		document.documentElement.style.cursor = 'url("cursor.svg") 18 3, default';
		var status = document.getElementById('status');
		status.appendChild(document.createTextNode('Well done. '));
		var playAgain = document.createElement('button');
		playAgain.addEventListener('click', function() { restart();});
		playAgain.appendChild(document.createTextNode('Play again'));
		status.appendChild(playAgain);
	} else if(overloaded.length == 0) {
		postChain();
	} else {
		var cell = overloaded.pop();
		if(cell.dataset.atoms > cell.dataset.maxAtoms) {
			explodeCell(cell, function() {chainReaction(postChain)});
		} else {
			chainReaction(postChain);
		}
	}
}

function isGameOver() {
	for(var i = 0, player, alive = 0; player = players[i]; i++) {
		if(player.alive) alive++;
	}
	return alive <= 1;
}

function restart() {
	for(var child; child = document.body.childNodes[1];) {
		document.body.removeChild(child);
	}
	askNumberOfPlayers();
}
