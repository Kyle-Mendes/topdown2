var TopDownGame = TopDownGame || {},
	leftKey,
	rightKey,
	upKey,
	downKey,
	pauseKey;

TopDownGame.Game = function() {};

//title screen
TopDownGame.Game.prototype = {
	create: function() {
		this.map = this.game.add.tilemap('map');
		//the first parameter is the tileset as specified in Tiled, second is the key to the asset
		this.map.addTilesetImage('tiles', 'tiles');

		//create layer
		this.backgroundLayer = this.map.createLayer('backgroundLayer');
		this.collisionLayer = this.map.createLayer('collisionLayer');
		this.foregroundLayer = this.map.createLayer('foregroundLayer');

		//collision on blockedLayer
		//start, stop, collides, layer, recalculate
		this.map.setCollisionBetween(1, 2000, true, 'collisionLayer');

		//resize the gameworld to match the layer dimensions
		this.backgroundLayer.resizeWorld();

		//the player
		// var result = this.findObjectsByType('playerStart', this.map, 'objectLayer');
		this.player = this.game.add.sprite(64, 64, 'player');
		this.game.physics.arcade.enable(this.player);

		//the shadow
		var shadowLocation = this.findObjectsByType('shadowStart', this.map, 'objectLayer');
		this.shadow = this.game.add.sprite(shadowLocation[0].x, shadowLocation[0].y, 'shadow');
		this.game.physics.arcade.enable(this.shadow);

		//setting the camera to follow our player
		this.game.camera.follow(this.player);

		//allowing character to move
		this.cursors = this.game.input.keyboard.createCursorKeys();

		leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
		rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
		upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
		downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
		pauseKey = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
	},

	//find objects in a Tiled layer that containt a property called "type" equal to a certain value
	findObjectsByType: function(type, map, layer) {
		var result = new Array();
		map.objects[layer].forEach(function(element){
			if(element.properties.type === type) {
				//Phaser uses top left, Tiled bottom left so we have to adjust
				//also keep in mind that the cup images are a bit smaller than the tile which is 16x16
				//so they might not be placed in the exact position as in Tiled
				element.y -= map.tileHeight;
				result.push(element);
			}
		});
		return result;
	},

	//create a sprite from an object
	createFromTiledObject: function(element, group) {
		var sprite = group.create(element.x, element.y, element.properties.sprite);

		//copy all properties to the sprite
		Object.keys(element.properties).forEach(function(key){
			sprite[key] = element.properties[key];
		});
	},
	collect: function(player, collectable) {
		collectable.destroy();
	},
	switchShadow: function(player, shadow) {
		var deltaX = Math.abs(player.position.x - shadow.position.x);
		var deltaY = Math.abs(player.position.y - shadow.position.y);

		if(deltaX < 160 && deltaY < 160) {
			// console.log('They\'re close!', shadow.texture);
			shadow.loadTexture('enemy');
			this.game.physics.arcade.moveToObject(shadow, player, 100);
		} else {
			// console.log('They\'re far!', shadow.texture);
			shadow.loadTexture('shadow');
			shadow.body.velocity.setTo(0,0);
		}
	},
	debugInformation: function() {
		var fps = this.game.time.fps;

		fpsCounter = this.game.add.text(20, 10, 'FPS: ' + fps, {
			font: '16px Arial',
			fill: '#fff',
			stroke: '#000',
			strokeThickness: 3
		});
	},
	update: function() {
		//player movement
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;

		if(this.cursors.up.isDown || upKey.isDown) {
			this.player.body.velocity.y -= 130;
		}
		else if(this.cursors.down.isDown || downKey.isDown) {
			this.player.body.velocity.y += 130;
		}
		if(this.cursors.left.isDown || leftKey.isDown) {
			this.player.body.velocity.x -= 130;
		}
		else if(this.cursors.right.isDown || rightKey.isDown) {
			this.player.body.velocity.x += 130;
		}

		if(pauseKey.isDown) {
			this.game.pause();
		}

		this.debugInformation();

		//Collision
		this.game.physics.arcade.collide(this.player, this.collisionLayer);
		this.game.physics.arcade.overlap(this.player, this.gems, this.collect, null, this);

		//Checking the shadow && player position to switch sprites when needed
		this.switchShadow(this.player, this.shadow);

		//Win condition

	}
};