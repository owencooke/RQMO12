// make a maze scene
import { Scene, } from 'phaser';

export class Maze extends Scene {
  constructor() {
    super('Maze');
    this.player;
    this.currentDirection = 'right';
    this.playerSpeed = 200;
    this.cursors;
    this.endPoint;
    this.holes1;
    this.holes2;
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    const map = this.make.tilemap({ key: 'maze', tileWidth: 32, tileHeight: 32 },);

    // Load tilesets
    const modernExteriors = map.addTilesetImage('modern_exteriors_32', 'modern_exteriors_32');
    // Create layers
    map.createLayer('Ground', modernExteriors, 0, 0);
    const wallLayer = map.createLayer('Walls', modernExteriors, 0, 0);
    wallLayer.setCollisionByExclusion([-1]);

    // Set up world bounds
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Get starting point
    const startPoint = map.findObject("Player", obj => obj.name === "StartPoint");
    const endPoint = map.findObject("Player", obj => obj.name === "EndPoint");
    this.endPoint = this.add.zone(endPoint.x, endPoint.y, 64, 64);
    this.physics.world.enable(this.endPoint);

    const holeObjects = map.getObjectLayer('Holes').objects;
    const holes1 = holeObjects[0];
    const holes2 = holeObjects[1];
    this.holes1 = this.add.zone(holes1.x, holes1.y, 64, 64).setOrigin(0.25, 0.25);
    this.holes2 = this.add.zone(holes2.x, holes2.y, 64, 64).setOrigin(0.25, 0.25);
    this.physics.world.enable(this.holes1);
    this.physics.world.enable(this.holes2);


    // Add player sprite
    this.player = this.physics.add.sprite(startPoint.x, startPoint.y, 'adam-run').setScale(1.25);
    this.physics.add.collider(this.player, wallLayer);
    this.player.setCollideWorldBounds(true);
    this.player.anims.play('run-right', true);
    this.cameras.main.setBounds(
      0,
      0,
      map.widthInPixels,
      map.heightInPixels
    );
    this.cameras.main.startFollow(this.player);

    this.homeButton = this.add.image(this.cameras.main.width - 32, 32, 'home')
      .setScrollFactor(0)
      .setOrigin(1, 0)
      .setScale(0.2)
      .setInteractive();

    this.scale.on('resize', (gameSize) => {
      this.cameras.main.setSize(gameSize.width, gameSize.height);
      this.homeButton.setPosition(this.cameras.main.width - 32, 32);
    });


    this.homeButton.on('pointerover', () => {
      this.game.canvas.style.cursor = 'pointer';
    });


    this.homeButton.on('pointerout', () => {
      this.game.canvas.style.cursor = 'default';
    });

    this.homeButton.on('pointerdown', () => {
      this.scene.start('City');
    });

    this.cursors = this.input.keyboard.createCursorKeys();


  }

  showCongratsMessage() {
    this.player.setVelocity(0);
    this.player.anims.stop();
    this.input.keyboard.shutdown();
    this.player.setActive(false);
    this.cameras.main.stopFollow();




    const message = this.add.text(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2,
      'Congratulations!', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }
    ).setOrigin(0.5, 0.5);




    this.time.delayedCall(1000, () => {
      message.destroy();
      this.scene.start('City');
    }, [], this);
  }


  update() {
    this.player.setVelocity(0);
    const speed = (this.cursors.shift.isDown ? 2 : 1) * this.playerSpeed;

    // Check for player reaching endPoint
    if (this.physics.overlap(this.player, this.endPoint)) {
      this.showCongratsMessage();
    }

    if (this.physics.overlap(this.player, this.holes1) || this.physics.overlap(this.player, this.holes2)) {
      this.scene.restart();
    }




    // Handle player keyboard movement and animation
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play("run-up", true);
      this.currentDirection = "up";
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play("run-down", true);
      this.currentDirection = "down";
    } else if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play("run-left", true);
      this.currentDirection = "left";
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play("run-right", true);
      this.currentDirection = "right";
    } else {
      this.player.anims.stop();
      this.player.setTexture(
        "adam-run",
        this.currentDirection === "right"
          ? 0
          : this.currentDirection === "up"
            ? 6
            : this.currentDirection === "left"
              ? 12
              : 18
      );
    }
  }


}