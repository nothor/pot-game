//Scene Controller
//https://labs.phaser.io/edit.html?src=src/scenes/tutorial/scene%20controller.js

class LoadScene extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'LoadScene', active: true });
    }
  
    preload() {
  
      var loadingText = this.make.text({
          x: WIDTH / 2,
          y: HEIGHT / 2 - 50,
          text: 'Loading...',
          style: {
              font: '20px monospace',
              fill: '#ffffff'
          }
      });
      loadingText.setOrigin(0.5, 0.5);
  
      var progressBar = this.add.graphics();
      var progressBox = this.add.graphics();
      progressBox.fillStyle(0x222222, 0.8);
      progressBox.fillRect(WIDTH/4-10, HEIGHT/2 - 10, WIDTH/2+20, 30+20);  //fillRect(x, y, width, height)
  
      this.load.on('progress', function (value) {
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        //progressBar.fillRect(0, 270, 800 * value, 60);
        progressBar.fillRect(WIDTH/4, HEIGHT/2, value * WIDTH/2, 30);
      });
  
      this.load.on('complete', function () {
        progressBox.destroy();
        progressBar.destroy();
        loadingText.destroy();
      });
  
      //Sounds
      this.load.audio('impact', 'assets/audio/fx/impact1.mp3');
      this.load.audio('impactPot', 'assets/audio/fx/impactPot.mp3');
      this.load.audio('splash', 'assets/audio/fx/splash_small1.mp3');
      this.load.audio('swingBass', 'assets/audio/fx/swing1.mp3');
      this.load.audio('swingHigh', 'assets/audio/fx/swing2.mp3');
      this.load.audio('boiling', 'assets/audio/fx/boiling.ogg');
      this.load.audio('gasIgnition', 'assets/audio/fx/gasIgnition.mp3');
      this.load.audio('wrong', 'assets/audio/fx/wrong.mp3');
      this.load.audio('collect', 'assets/audio/fx/collect.mp3');
      this.load.audio('complete', 'assets/audio/fx/levelComplete.mp3'); //levelComplete or success
  
      this.load.audio('musicInGame', 'assets/audio/music.mp3');
  
      //Images
      this.load.image('bullet', 'assets/sprites/cheese.png');
      this.load.spritesheet('rat', 'assets/sprites/rat32wh.png',    { frameWidth: 32, frameHeight: 32 } );
      this.load.image('pot', 'assets/sprites/pot.png');
      this.load.image('drop', 'assets/sprites/drop.png');
      this.load.image('potFront', 'assets/sprites/potFront.png');
      this.load.image('background', 'assets/sprites/background.jpg');
      this.load.spritesheet('water', 'assets/sprites/water.png',    { frameWidth: 356, frameHeight: 98 } );
      this.load.spritesheet('fruits', 'assets/sprites/fruitnveg32wh37.png', { frameWidth: 32, frameHeight: 32 });
  
      //Fonts
      this.load.bitmapFont('gem', 'assets/fonts/bitmap/gem.png', 'assets/fonts/bitmap/gem.xml');
    }
  
    create ()
    {
      this.socket = io();
    
      //Grab a reference to the Game Scene, we take everything! (i.e events)
      //let ourGame = this.scene.get('GameScene');
      //ourGame.events.on('checkRecept', checkUpdateRecept, this);

      //We can add some kind of "Press Start"
      this.scene.start('GameScene');      //Stops the current Scene and Starts the new
      //this.scene.launch('GameScene');    //Starts the new in Parallel.    
    }
}