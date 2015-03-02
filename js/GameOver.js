var TopDownGame = TopDownGame || {};

TopDownGame.GameOver = function() {};

//setting game config
TopDownGame.GameOver.prototype = {
	create: function() {
		pause_label = this.game.add.text(110, 140, 'You win!', { font: '24px Arial', fill: '#fff' });
	}
};