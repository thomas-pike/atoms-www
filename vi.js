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
			// execute a valid move.
			do {
				var x = this.getRandomInt(1, numColumns);
				var y = this.getRandomInt(1, numRows);
			} while(!doMove(document.getElementById('cell_' + x + '_' + y)));
		}
	}
}
