var TopDownGame = TopDownGame || {};

//loading game assets
TopDownGame.Preload = function() {};

TopDownGame.Preload.prototype = {
	preload: function() {
		//load game assets
		this.load.tilemap('map1', 'assets/tilemaps/map1.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('map2', 'assets/tilemaps/map2.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.image('tiles', 'assets/images/tiles.png');
		this.load.image('life', 'assets/images/heart.png');
		this.load.image('closedTrapdoor', 'assets/images/closedTrapdoor.png');
		this.load.image('openTrapdoor', 'assets/images/openTrapdoor.png');
		this.load.image('stairsUp', 'assets/images/stairsUp.png');
		this.load.image('stairsDown', 'assets/images/stairsDown.png');
		this.load.image('key', 'assets/images/key.png');
		this.load.image('player', 'assets/images/player.png');
		this.load.image('shadow', 'assets/images/shadow.png');
		this.load.image('enemy', 'assets/images/enemy.png');

		//Set advanced timing for FPS readout
		this.game.time.advancedTiming = true;

		//@todo: figure out the console error on touch
		this.game.input.touch.enabled = true;
		this.game.maxPointers = 1;
	},
	create: function() {
		welcomeMessage = this.game.add.text(175, 50, 'Top Down 2!', { font: '50px Arial', fill: '#fff' });
		subMessage = this.game.add.text(250, 100, 'Electric Boogaloo', { font: '16px Arial', fill: '#fff' });

		startMessage = this.game.add.text(230, 500, 'Click anywhere to start', { font: '16px Arial', fill: '#fff'});
		startMessage.alpha = 0.2;
	},
	update: function() {
		if (startMessage.alpha >= 1) {
			this.game.add.tween(startMessage).to({alpha: .2}, 2000, Phaser.Easing.Linear.None, true);
		} else if (startMessage.alpha <= .2) {
			this.game.add.tween(startMessage).to({alpha: 1}, 2000, Phaser.Easing.Linear.None, true);
		}

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