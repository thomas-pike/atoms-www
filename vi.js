class VI {
	constructor(playerId, level) {
		this.playerId = playerId;
		this.level = level;
	}

	getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	play() {
		if(this.level == 1) {
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
