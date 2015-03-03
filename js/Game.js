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

// TopDownGame.Game = function() {};

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

		//Adding doors and keys
		this.createDoors();
		this.createKeys();

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

		//camera follows the player
		this.game.camera.follow(this.player);

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
			//Set booleans from a string to a proper boolean
			if(element.properties[key] == "true") {
				element.properties[key] = true;
			} else if(element.properties[key] == "false") {
				element.properties[key] = false;
			}
			sprite[key] = element.properties[key];
		});
	},
	createDoors: function() {
		//create any doors on the map
		this.doors = this.game.add.group();
		this.doors.enableBody = true;

		var doors;
		result = this.findObjectsByType('door', this.map, 'objectLayer');
		result.forEach(function(element){
			this.createFromTiledObject(element, this.doors);
		}, this);
	},
	createKeys: function() {
		//create any keys on the map
		this.keys = this.game.add.group();
		this.keys.enableBody = true;

		var keys;
		result = this.findObjectsByType('key', this.map, 'objectLayer');
		result.forEach(function(element){
			this.createFromTiledObject(element, this.keys);
		}, this);
	},
	collect: function(player, collectable) {
		if(collectable.type == 'key') {
			this.openDoor(collectable);
		}
		collectable.destroy();
	},
	openDoor: function(key) {
		var doorID = key.doorID;
		this.doors.forEach(function(door) {
			if(door.doorID == doorID) {
				door.loadTexture('openTrapdoor');
				door.open = true;
			}
		});
	},
	changeMap: function(player, door) {
		if(!door.open) {
			console.log(door.open);
			return;
		}
		var newMap = door.targetTilemap;
		this.game.state.start()
	},
	switchShadow: function(player, shadow) {
		var deltaX = Math.abs(player.position.x - shadow.position.x);
		var deltaY = Math.abs(player.position.y - shadow.position.y);

		if(deltaX < 160 && deltaY < 160) {
			shadow.loadTexture('enemy');
			shadow.alpha = 1;
			this.game.physics.arcade.moveToObject(shadow, player, 115);
		} else {
			shadow.loadTexture('shadow');
			shadow.alpha = .8;
			this.game.physics.arcade.moveToObject(shadow, player, 80);
		}
	},
	loseLife: function(player, shadow) {
		this.player.reset(64, 64);
		lives.removeChild(lives.children[lives.total - 1]);
		cameraX = 0; cameraY = 0;
		this.game.camera.focusOnXY(0,0);
	},
	update: function() {
		//player movement
		//@todo fine tune this.  doesn't feel right.
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
		if(this.game.input.activePointer.isDown) {
			// @todo make it so you don't need to hold down the pointer
			this.game.physics.arcade.moveToPointer(this.player, 140);
		}

		if(pauseKey.isDown) {
			this.game.pause();
		}

		if(debugKey.isDown) {
			debug = !debug;
		}

		//Collision
		this.game.physics.arcade.collide(this.player, this.collisionLayer);
		this.game.physics.arcade.overlap(this.player, this.doors, this.changeMap, null, this);
		this.game.physics.arcade.overlap(this.player, this.keys, this.collect, null, this);
		this.game.physics.arcade.overlap(this.player, this.shadow, this.loseLife, null, this);

		//Checking the shadow && player position to switch sprites when needed
		// this.switchShadow(this.player, this.shadow);

		//Win condition

		//Loss condition
		if(lives.total === 0) {
			this.state.start('GameOver');
		}

	}
};