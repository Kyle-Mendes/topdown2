var TopDownGame = TopDownGame || {},
	debug = false,
	h = 640,
	w = 640,
	cameraX = 0,
	cameraY = 0,
	leftKey,
	rightKey,
	upKey,
	downKey,
	pauseKey,
	debugKey,
	lives;

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

		//allowing character to move
		this.cursors = this.game.input.keyboard.createCursorKeys();

		//lives counter
		lives = this.game.add.group();
		lives.fixedToCamera = true;
		lives.create(32, 6, 'life');
		lives.create(64, 6, 'life');
		lives.create(96, 6, 'life');

		leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
		rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
		upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
		downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
		pauseKey = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
		debugKey = this.game.input.keyboard.addKey(Phaser.Keyboard.F);

		//adding touch controlls
		this.game.input.touch.enabled = true;
		// this.game.input.onDown.add(this.touched, this);
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
	moveCamera: function() {
		// @todo: fix camera movement.  maybe stop player movement while camera moving?

		// Don't allow tweens to build up if you go back and forth really fast
		if (this.tween)
			return;

		this.tween = true;
		var toMove = false,
			speed = 600;

		if (this.player.y + 16 > this.game.camera.y + h) {
			cameraY += 1;
			toMove = true;
		}
		else if (this.player.y - 16 < this.game.camera.y) {
			console.log(this.player.y, this.game.camera.y);
			cameraY -= 1;
			toMove = true;
		}
		else if (this.player.x > this.game.camera.x + w) {
			cameraX += 1;
			toMove = true;
		}
		else if (this.player.x < this.game.camera.x) {
			cameraX -= 1;
			toMove = true;
		}
		if (toMove) {
			var t = this.game.add.tween(this.game.camera).to({x: cameraX * w, y: cameraY * h}, speed);
			t.start();
			t.onComplete.add(function(){this.tween = false;}, this);
		} else {
			this.tween = false;
		}
	},
	collect: function(player, collectable) {
		collectable.destroy();
	},
	switchShadow: function(player, shadow) {
		var deltaX = Math.abs(player.position.x - shadow.position.x);
		var deltaY = Math.abs(player.position.y - shadow.position.y);

		if(deltaX < 160 && deltaY < 160) {
			shadow.loadTexture('enemy');
			shadow.alpha = 1;
			this.game.physics.arcade.moveToObject(shadow, player, 100);
		} else {
			shadow.loadTexture('shadow');
			shadow.alpha = .8;
			this.game.physics.arcade.moveToObject(shadow, player, 50);
		}
	},
	debugInformation: function() {
		var fps = this.game.time.fps;

		if (debug) {
			fpsCounter = this.game.add.text(20, 10, 'FPS: ' + fps, {
				font: '16px Arial',
				fill: '#fff',
				stroke: '#000',
				strokeThickness: 3
			});
		}
	},
	touched: function(event) {
		// @todo: make this work
		console.log(event);
		this.game.physics.arcade.moveToXY(this.player, event.position.x, event.position.y, 130, 10000);
	},
	loseLife: function(player, shadow) {
		this.player.reset(64, 64);
		lives.removeChild(lives.children[lives.total - 1]);
		cameraX = 0; cameraY = 0;
		this.game.camera.focusOnXY(0,0);
	},
	update: function() {
		//player movement
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;

		if(this.cursors.up.isDown || upKey.isDown) {
			this.player.body.velocity.y -= 300;
		}
		else if(this.cursors.down.isDown || downKey.isDown) {
			this.player.body.velocity.y += 300;
		}
		if(this.cursors.left.isDown || leftKey.isDown) {
			this.player.body.velocity.x -= 300;
		}
		else if(this.cursors.right.isDown || rightKey.isDown) {
			this.player.body.velocity.x += 300;
		}

		if(pauseKey.isDown) {
			this.game.pause();
		}

		if(debugKey.isDown) {
			debug = !debug;
		}

		// @todo: right now, it makes a new line of text each frame, that's really bad
		// this.debugInformation();
		//
		// Taking care of the camera
		this.moveCamera();

		//Collision
		this.game.physics.arcade.collide(this.player, this.collisionLayer);
		this.game.physics.arcade.overlap(this.player, this.shadow, this.loseLife, null, this);
		this.game.physics.arcade.overlap(this.player, this.gems, this.collect, null, this);

		//Checking the shadow && player position to switch sprites when needed
		this.switchShadow(this.player, this.shadow);

		//Win condition

		//Loss condition
		if(lives.total === 0) {
			this.state.start('GameOver');
		}

	}
};