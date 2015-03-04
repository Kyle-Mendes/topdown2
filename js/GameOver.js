var TopDownGame = TopDownGame || {};

TopDownGame.GameOver = function() {};

//setting game config
TopDownGame.GameOver.prototype = {
	create: function() {
		gameOver = this.game.add.text(130, 308, 'You have lost.  Click to try again.', { font: '24px Arial', fill: '#fff' });
	},
	update: function() {
		if (this.game.input.activePointer.isDown) {
			var initialMap = {
				targetTilemap: 'map1',
				targetX: 64,
				targetY: 64
			};
			this.state.start('Game', true, false, initialMap);
		}
	}
};