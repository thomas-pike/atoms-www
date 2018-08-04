'use strict';
var numColumns = 10;
var numRows = 6;
var playerColors = ['#ff5555', '#55ff55', '#ffcc55', '#55ccff'];
var players = [];
var minPlayers = 2;
var maxPlayers = 4;
var inputActive = false;
var playerId = 0;
var moves = 0;
var overloaded = [];
var debug = 0;

document.addEventListener('DOMContentLoaded', function() {
	var params = new URLSearchParams(window.location.search.substring(1));
	if(params.get('debug')) {
		debug = params.get('debug');
	}
	setupDefaults();
	if(debug) {
		for(var i = 0; i <= 1; i++) {
			players[i].vi = new VI(i, -1);
		}
		setupGame();
	} else {
		configureGame();
	}
}, false);

class Player {
	constructor(playerId) {
		this.playerId = playerId;
		this.color = playerColors[playerId];
		this.alive = true;
		this.turns = 0;
		this.atoms = 0;
		this.wins = 0;
	}
}

function setupDefaults() {
	for(var i = 0; i <= 1; i++) {
		players[i] = new Player(i);
	}
}

function configureGame() {
	var intro = document.createElement('div');
	intro.id = 'intro';
	document.body.appendChild(intro);
	var p = document.createElement('p');
	p.appendChild(document.createTextNode('Number of players: '));
	for(var i = minPlayers; i <= maxPlayers; i++) {
		var radio = document.createElement('input');
		radio.type = 'radio';
		radio.name = 'players';
		radio.id = 'players_' + i;
		radio.value = i;
		if(i == players.length) {
			radio.checked = true;
		}
		radio.addEventListener('change', function() { setNumberOfPlayers(this.value)});
		p.appendChild(radio);
		var label = document.createElement('label');
		label.htmlFor = 'players_' + i;
		label.appendChild(document.createTextNode(i));
		p.appendChild(label);
	}
	intro.appendChild(p);
	var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	for(var i = 0; i <= 3; i++) {
		var tr = document.createElement('tr');
		tr.id = 'playerOptions' + i;
		if(!players[i]) tr.style.display = 'none';
		var th = document.createElement('th');
		th.className = 'player' + i;
		th.appendChild(document.createTextNode('Player ' + (i + 1)));
		tr.appendChild(th);
		var playerTypes = ['Human', 'CPU (Easy)', 'CPU (Medium)'];
		for(var j = 0, playerType; playerType = playerTypes[j]; j++) {
			var td = document.createElement('td');
			var radio = document.createElement('input');
			radio.type = 'radio';
			radio.name = 'player' + i;
			radio.id = 'player_' + i + '_' + j;
			radio.dataset.playerId = i;
			radio.value = j;
			if(j == 0 && (!players[i] || !players[i].vi)) {
				radio.checked = true;
			} else if (players[i] && players[i].vi && players[i].vi.level == j) {
				radio.checked = true;
			}
			radio.addEventListener('change', function() { configurePlayer(parseInt(this.dataset.playerId), parseInt(this.value))});
			td.appendChild(radio);
			var label = document.createElement('label');
			label.htmlFor = 'player_' + i + '_' + j;
			label.appendChild(document.createTextNode(playerType));
			td.appendChild(label);
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);
	intro.appendChild(table);
	var p = document.createElement('p');
	var button = document.createElement('button');
	button.appendChild(document.createTextNode('Start game'));
	button.addEventListener('click', function() { setupGame(parseInt(this.dataset.players));}, false);
	p.appendChild(button);
	intro.appendChild(p);
}

function setNumberOfPlayers(numPlayers) {
	for(var i = maxPlayers - 1; i >= 0; i--) {
		if(i < numPlayers) {
			if(!players[i]) {
				players[i] = new Player(i);
				var level = document.querySelector('input[name="player' + i + '"]:checked').value;
				if(level > 0) {
					players[i].vi = new VI(i, level);
				}
			}
			document.getElementById('playerOptions' + i).style.display = '';
		} else {
			if(players[i]) {
				players.pop();
			}
			document.getElementById('playerOptions' + i).style.display = 'none';
		}
	}
}

function configurePlayer(playerId, level) {
	if(level == 0) {
		delete players[playerId].vi;
	} else {
		if(!players[playerId].vi) {
			players[playerId].vi = new VI(playerId, level);
		} else {
			players[playerId].vi.level = level;
		}
	}
}

function setupGame() {
	if(document.getElementById('intro')) {
		document.body.removeChild(document.getElementById('intro'));
	}
	var status = document.createElement('div');
	status.id = 'status';
	document.body.appendChild(status);
	overloaded = [];
	playerId = -1;
	var board = createBoard(numColumns, numRows);
	var playerList = document.createElement('div');
	playerList.id = 'playerList';
	document.body.appendChild(playerList);
	window.requestAnimationFrame(function() {
		window.requestAnimationFrame(function() {
			board.className = '';
			board.addEventListener('transitionend', function endZoomAnimation() {
				for(var i = 0; i < players.length; i++) {
					var playerIcon = document.createElement('div');
					playerIcon.className = 'player player' + i;
					playerList.appendChild(playerIcon);
				}
				var cells = board.childNodes;
				fillCells(cells);
				board.removeEventListener('transitionend', endZoomAnimation, false);
			}, false);
		});
	});
}

function createBoard(numColumns, numRows) {
	var board = document.createElement('div');
	board.id = 'board';
	board.className = 'start';
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

function fillCells(cells) {
	for(var i = 0, cell; cell = cells[i]; i++) {
		setTimeout(fillCell, 50 * (numRows + numColumns - parseInt(cell.style.gridColumn) - parseInt(cell.style.gridRow)), cell);
	}
	setTimeout(nextPlayer, 50 * (numRows + numColumns));
}

function fillCell(cell) {
	cell.className = 'cell filled';
}

function cellClick(cell) {
	if(!inputActive) return false;
	doMove(cell);
}

function doMove(cell) {
	if(cell.dataset.playerId == -1 || cell.dataset.playerId == playerId) {
		moves++;
		var activePlayerId = playerId;
		inputActive = false;
		players[playerId].turns++;
		addAtom(cell, playerId, function() {
			chainReaction(function() {
				if(playerId == activePlayerId) {
					nextPlayer();
				}
			});
		});
		return true;
	} else {
		return false;
	}
}

function nextPlayer() {
	if(debug && moves >= debug) {
		for(var i = 0; i <= 1; i++) {
			delete players[i].vi;
		}
	}
	playerId++;
	if(!players[playerId]) playerId = 0;
	if(!players[playerId].alive) {
		nextPlayer();
	} else if(players[playerId].vi) {
		document.documentElement.style.cursor = 'url("cursor.svg") 18 3, default';
		setTimeout(function() {players[playerId].vi.play()}, 300);
	} else {
		document.documentElement.style.cursor = 'url("cursor-player' + playerId + '.svg") 18 3, default';
		inputActive = true;
	}
}

function addAtom(cell, playerId, postAdd) {
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
	if(parseInt(cell.dataset.atoms) == parseInt(cell.dataset.maxAtoms) + 1) {
		overloaded.push(cell);
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
	players[cell.dataset.playerId].atoms -= parseInt(cell.dataset.maxAtoms) + 1;
	var overflowAtoms = parseInt(cell.dataset.atoms) - (parseInt(cell.dataset.maxAtoms) + 1);
	cell.dataset.atoms = 0;
	if(overflowAtoms == 0) {
		cell.dataset.playerId = -1;
	} else {
		for(var i = 1; i <= overflowAtoms; i++) {
			cell.dataset.atoms++;
			var newAtom = document.createElement('div');
			newAtom.className = 'atom atom' + i + ' player' + playerId + ' pos' + (overflowAtoms - i + 1);
			cell.appendChild(newAtom);
		}
	}
	var x = parseInt(cell.style.gridColumn, 10);
	var y = parseInt(cell.style.gridRow, 10);
	var neighbours = ['cell_' + (x - 1) + '_' + y, 'cell_' + (x + 1) + '_' + y, 'cell_' + x + '_' + (y - 1), 'cell_' + x + '_' + (y + 1)];
	var neighbour;
	for(var i = 0, neighbourId; neighbourId = neighbours[i]; i++) {
		if(neighbour = document.getElementById(neighbourId)) {
			addAtom(neighbour, playerId, postAdd);
			postAdd = function(){};
		}
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
	} else if(cell.dataset.atoms == 4) {
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
	} else if(cell.dataset.atoms >= 5) {
		console.log(cell.dataset.atoms + " at " + cell.id);
		newAtom.className = 'atom atom5 player' + cell.dataset.playerId + ' pos1 size0';
		cell.appendChild(newAtom);
		window.requestAnimationFrame(function() {
			window.requestAnimationFrame(function() {
				newAtom.className = 'atom atom5 player' + cell.dataset.playerId + ' pos1';
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
	for(var i = 0, player; player = players[i]; i++) {
		player.alive = true;
		player.turns = 0;
		player.atoms = 0;
	}
	configureGame();
}
