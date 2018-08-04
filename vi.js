'use strict';
class VI {
	constructor(playerId, level) {
		this.playerId = playerId;
		this.level = level;
		if(this.level == -1) {
			this.moves = this.getTestSequence();
		}
	}

	getTestSequence() {
		// Recreate the game shown at https://youtu.be/kEDjZyG2g-g
		// After each move the board state should be identical to that in the video
		// for the same move.
		if(this.playerId == 0) {
			var moves = [
				'4_4', '9_1', '1_1', '4_3', '4_3',
				'3_2', '4_3', '5_3', '4_3', '2_1',
				'5_3','10_5', '5_3', '7_1', '4_4',
				'3_4', '4_4', '4_3', '4_3', '6_2',
				'1_4', '5_4', '5_4', '6_4', '5_3',
				'5_3', '5_3', '6_1', '6_3', '6_2',
				'6_2', '4_1', '6_1', '3_1', '5_2',
				'4_2', '6_4', '5_2', '4_3', '5_2',
				'9_1', '9_1', '8_1', '7_3', '7_2',
				'4_2', '7_2', '1_4', '1_4', '2_4',
				'5_2', '4_4', '4_2', '2_2'
			];
		} else {
			var moves = [
				'8_5', '9_5', '7_6', '8_4', '8_3',
				'8_4', '8_4', '8_4', '6_4', '7_5',
				'9_5', '8_3', '8_3', '8_5', '8_5',
				'9_5', '9_4', '9_4', '8_4', '8_4',
				'7_4', '7_4', '7_5', '8_4', '8_3',
				'8_4', '9_3', '8_3', '9_4', '8_3',
				'8_2', '8_2', '7_2', '7_3', '6_3',
				'5_4', '6_2', '6_3', '7_4', '6_4',
				'5_3', '6_4', '4_4', '6_4', '8_4',
				'3_3', '5_2', '3_4', '3_3', '3_6',
				'3_5', '3_4', '5_4'
			];
		}
		return moves;
	}

	getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	play() {
		if(this.level == -1) {
			var move;
			if(move = this.moves.shift()) {
				doMove(document.getElementById('cell_' + move));
			}
		} else if(this.level == 1) {
			// Play completely randomly, don't even look at the board state!
			// Note: could theoretically loop for a very long time trying to
			// execute a valid move, but in practice this does not happen.
			do {
				var x = this.getRandomInt(1, numColumns);
				var y = this.getRandomInt(1, numRows);
			} while(!doMove(document.getElementById('cell_' + x + '_' + y)));
		} else if(this.level >= 2) {
			// Important survival rules:
			// - Always detonate a fully-loaded cell if adjacent to an enemy fully-loaded cell
			// - Avoid playing in a cell next to an enemy fully-loaded cell
			var fullCells = [];
			for(var i = 1; i <= 3; i++) {
				fullCells = fullCells.concat(...document.querySelectorAll('#board .cell[data-atoms="' + i + '"][data-max-atoms="' + i + '"]'));
			}
			var detonateCells = [];
			var dangerCoords = {};
			for(var i = 0, cell; cell = fullCells[i]; i++) {
				if(cell.dataset.playerId != this.playerId) {
					var x = parseInt(cell.style.gridColumn);
					var y = parseInt(cell.style.gridRow);
					var neighbours = ['cell_' + (x - 1) + '_' + y, 'cell_' + (x + 1) + '_' + y, 'cell_' + x + '_' + (y - 1), 'cell_' + x + '_' + (y + 1)];
					var neighbour;
					for(var j = 0, neighbourId; neighbourId = neighbours[j]; j++) {
						if(neighbour = document.getElementById(neighbourId)) {
							if(neighbour.dataset.playerId == this.playerId && neighbour.dataset.atoms == neighbour.dataset.maxAtoms) {
								detonateCells.push(neighbour);
							} else {
								dangerCoords['cell_' + (parseInt(neighbour.style.gridColumn) + '_' + parseInt(neighbour.style.gridRow))] = true;
							}
						}
					}
				}
			}
			if(detonateCells.length > 0) {
				// Blow up one of these cells
				var cell = detonateCells[Math.floor(Math.random() * detonateCells.length)];
				doMove(cell);
				return;
			}
			if(this.level == 3) {
				// Play with a bit of strategy:
				// - Strongly prefer a place that gives an atom advantage over a neighbouring cell
				// - Prefer claiming a corner
				if(Math.random() < 0.9) {
					var cells = document.querySelectorAll('#board .cell');
					var priorityCells = [];
					for(var i = 0, cell; cell = cells[i]; i++) {
						if(cell.dataset.atoms > 0 && cell.dataset.playerId != this.playerId) {
							var x = parseInt(cell.style.gridColumn);
							var y = parseInt(cell.style.gridRow);
							var neighbours = ['cell_' + (x - 1) + '_' + y, 'cell_' + (x + 1) + '_' + y, 'cell_' + x + '_' + (y - 1), 'cell_' + x + '_' + (y + 1)];
							var neighbour;
							for(var j = 0, neighbourId; neighbourId = neighbours[j]; j++) {
								if(neighbour = document.getElementById(neighbourId)) {
									if(neighbour.dataset.playerId == this.playerId || neighbour.dataset.playerId == "-1") {
										if(parseInt(neighbour.dataset.maxAtoms) - parseInt(neighbour.dataset.atoms) <= parseInt(cell.dataset.maxAtoms) - parseInt(cell.dataset.atoms)) {
											if(!dangerCoords[neighbourId]) {
												priorityCells.push(neighbour);
											}
										}
									}
								}
							}
						}
					}
					if(priorityCells.length > 0) {
						// Add to one of the priority cells
						var cell = priorityCells[Math.floor(Math.random() * priorityCells.length)];
						doMove(cell);
						return;
					}
				}
				if(Math.random() < 0.8) {
					var corners = ['cell_1_1', 'cell_' + numColumns + '_1', 'cell_1_' + numRows, 'cell_' + numColumns + '_' + numRows];
					for(var i = 0, cornerId; cornerId = corners[i]; i++) {
						var corner = document.getElementById(cornerId);
						if(corner.dataset.atoms == 0 && !dangerCoords[corner.id]) {
							doMove(corner);
							return;
						}
					}
				}
			}
			// Play semi-randomly, trying to avoid danger cells
			var tries = 0;
			do {
				tries++;
				var x = this.getRandomInt(1, numColumns);
				var y = this.getRandomInt(1, numRows);
			} while((dangerCoords['cell_' + x + '_' + y] && tries < 20) || !doMove(document.getElementById('cell_' + x + '_' + y)));
		}
	}
}
