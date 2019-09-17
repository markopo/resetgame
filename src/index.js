import Phaser from "phaser";
import sky from "./assets/sky.png";
import ground from "./assets/platform.png"
import star from "./assets/star.png";
import bomb from "./assets/bomb.png";
import dude from "./assets/dude.png";


const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
    render: render
  }
};

const game = new Phaser.Game(config);

function preload() {
 // this.load.image("logo", logoImg);

  this.load.image('sky', sky);

  this.load.image('ground', ground);

  this.load.image('star', star);

  this.load.image('bomb', bomb);

  this.load.spritesheet('dude', dude, { frameWidth: 32, frameHeight: 48 });


}

var platforms;
var player;
var cursors;
var stars;
var score = 0;
var scoreText;
var bombs;
var life = 5;
var lifeText;
var gameOver = false;
var gameOverText;
var gameLevel = 1;
var gameLevelText;

var turbo = 1;


const playerSpeed = {
      left: () => (-100 * turbo),
      right: () => (100 * turbo),
      up: () => (-250 * turbo),
      down: 35
};

const labelTexts = {
      score: () => 'Score: ' + score.toString(),
      life: () => 'Life: ' + life.toString(),
      level: () => 'Level: ' + gameLevel.toString()
};

function create() {

  this.add.image(400, 300, 'sky');

  scoreText = this.add.text(16, 5, labelTexts.score(), { fontSize: '32px', fill: '#000' });

  lifeText = this.add.text(230, 5, labelTexts.life(), { fontSize: '32px', fill: '#000' });

  gameLevelText = this.add.text(400, 5, labelTexts.level(), { fontSize: '32px', fill: '#000' });

  platforms = this.physics.add.staticGroup();

  platforms.create(400, 568, 'ground').setScale(2).refreshBody();

  platforms.create(600, 400, 'ground');

  platforms.create(50, 250, 'ground');

  platforms.create(750, 220, 'ground');

  player = this.physics.add.sprite(100, 450, 'dude');

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);


  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [ { key: 'dude', frame: 4 }],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  this.physics.add.collider(player, platforms);

  cursors = this.input.keyboard.createCursorKeys();

  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
  });

  stars.children.iterate(child => {
    //child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    child.setBounce(Phaser.Math.FloatBetween(0.1, 0.9));
  });

  this.physics.add.collider(stars, platforms);

  this.physics.add.overlap(player, stars, collectStar, null, this);

  bombs = this.physics.add.group();
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);


}


function update() {


  if(cursors.left.isDown){
      player.setVelocityX(playerSpeed.left());
      player.anims.play('left', true);
  }
  else if(cursors.right.isDown){
      player.setVelocityX(playerSpeed.right());
      player.anims.play('right', true);
  }
  else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }

  if(cursors.up.isDown && player.body.touching.down){
    player.setVelocityY(playerSpeed.up());
  }

  if(cursors.down.isDown && !player.body.touching.up){
    player.setVelocityY(playerSpeed.down);
  }


  if(cursors.space.isDown){
     turbo = 2;
  }
  else {
     turbo = 1;
  }

}

function render() {


}

function collectStar(player, star) {
  star.disableBody(true, true);

  score += 10;
  scoreText.setText(labelTexts.score());

  if(stars.countActive(true) === 0){

      gameLevel += 1;
      gameLevelText.setText(labelTexts.level());

      if(gameLevel === 5){
        gameOverText = this.add.text(200, 150, 'YOU WIN!', { fontSize: '80px', fill: '#0f0' });
        playAgain();
        return;
      }

      stars.children.iterate(child => child.enableBody(true, child.x, 0, true, true));
      const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      for(let i=0;i<gameLevel;i++) {
        const bomb = bombs.create(x, 5, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      }

  }
}


function hitBomb(player, bomb){
  this.physics.pause();

  bomb.disableBody(true, true);

  player.setTint(0xff0000);

  player.anims.play('turn');

  life -= 1;
  lifeText.setText(labelTexts.life());

  if(life === 0){
    gameOver = true;
    gameOverText = this.add.text(200, 150, 'GAME OVER!', { fontSize: '80px', fill: '#f00' });

    playAgain();
  }

  if(gameOver === false) {
    setTimeout(() => {
      this.physics.resume();
      player.clearTint();
    }, 2500);
  }


}

function playAgain() {
  setTimeout(() => {
    if(confirm("Dou you want to play again?")){
      window.location.reload();
    }
  }, 1000);
}
