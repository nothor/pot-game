//Ejemplo de aparecer y desaparecer objetos
//https://labs.phaser.io/edit.html?src=src/game%20objects/group/sprite%20pool.js

const WIDTH = 800;  //this.cameras.main.width;
const HEIGHT = 600; //this.cameras.main.width;
const soupTint = 0xdfff80;  //https://www.w3schools.com/colors/colors_picker.asp
//Ini Game Values
var gameLevel = 1;  //we set the numberScreenItems and numberReceptItems depending on it.
var numberReceptItems = 2; //Recept, depending on the Level
var MaxSameItems = 2; //Max Number Items per Ingredient in Recept
var numberScreenItems = 2*numberReceptItems; //Simultaneous, depending on the Level
var levelReady = true;

var weapon;
var rat;
var pot;
var potSides;
var water;
var gamepad;
var debugText;
var lastFired = 0;
const delayFire = 200;  //Delay between fired bullets
const delayItems = 500;
var spaceLaunch;
var spaceInGame;
var spaceInPot;
var bullets;

//Particles
var dropSplash;

//Sounds
var gasIgnitionFX;
var boilingFX;
var impactFX;
var impactPotFX;
var splashFX;
var swingBassFX;
var swingHighFX;
var wrongItemFX;
var rightItemFX;
var completeFX;


//To Ini
var ingredients;  //ingredients in Screen
var levelFrames = [];   //Available frames to choose per level
var receptItemsArray = [];
var receptItems;

//For debugging      
var lifeLeft;
var rightTopText;
var centerText;

  var Bullet = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Image,

    initialize:

    function Bullet (scene)
    {
        console.log('New Bullet!')
        Phaser.Physics.Arcade.Image.call(this, scene, 0, 0, 'bullet');

        //this.setBlendMode(1); //Para que ilumine el fondo!
        this.setDepth(3);

        this.speed = 700;       //Speed of the bullet!

        //this._temp = new Phaser.Math.Vector2();
    },

    fire: function (weapon)
    {
      this.lifespan = 1000;   //Reset Lifespan in fire

      //Make it alive again
      this.setActive(true);

      this.setPosition(weapon.x, weapon.y);
      this.setAngle(weapon.body.rotation); //Angle of the Sprite
      this.body.reset(weapon.x, weapon.y);
      this.body.setSize(this.width/2, this.height/2);  //Size of the Body in Pixels!
        
      var angle = Phaser.Math.DegToRad(weapon.body.rotation) - Math.PI/2;  //Angle shot direction
      this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

      //Make it visible
      this.setVisible(true);
    },

    update: function (time, delta)
    {
        this.lifespan -= delta;
        if (this.lifespan <= 0) { this.kill(); }
    },

    kill: function ()
    {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
    }

  });
  
  var Ingredient = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize: function (scene, x, y, key, frame)  //Executed when get() creates a new Element
    {
      //ONLY executed in .get()
      //get( [x] [, y] [, key] [, frame] [, visible])

      Phaser.Physics.Arcade.Sprite.call(this, scene, x, y, key, frame); //Phaser.Math.Between(0, 36)
      this.setDepth(1); //TO be over water but behind pot

      //NO da tiempo a tener un .body
    },

    launch: function () //function created
    {
      var pStart = new Phaser.Math.Vector2(this.x, this.y);  //Inicializamos vector (x: 0, y:0)
      var pEnd = new Phaser.Math.Vector2();  //Inicializamos vector (x: 0, y:0)

      spaceInGame.getRandomPoint(pEnd);  //Fijamos punto aleatorio dentro del rectangulo (x: X, y:Y)

      this.setAngularVelocity(Phaser.Math.Between(-50, 50));
      this.setBounce(0.3);  //Si queremos fijar valores al body

      var angle = Phaser.Math.Angle.BetweenPoints(pStart, pEnd);
      this.scene.physics.velocityFromRotation(angle, Phaser.Math.Between(100, 400), this.body.velocity);

      this.checkOutOfBounds = false;  //In order to NOT destroy when created out of the screen.
  
    },

    update: function (time, delta)
    {
      var withinGame = spaceInGame.contains(this.x, this.y);
      var insidePot = spaceInPot.contains(this.x, this.y);
      if (!this.checkOutOfBounds && withinGame)
      {
          this.checkOutOfBounds = true;
      }
      else if (this.checkOutOfBounds && !withinGame)	//If the Object is out of the game screen --> Kill It and Launch another one
      {
        if(insidePot){
          //  Dispatch a Scene event
          this.scene.events.emit('checkRecept', this);  //Argument is this = item
        }
        this.destroy();   //lo eliminamos, OJO! No eliminar hasta que hayamos llamado a la función this.scene anterior!
        //this.kill();      //lo desactivamos (según como hayamos programado la función) 
        addIngredient(levelFrames[Phaser.Math.Between(0, levelFrames.length)]); //creamos uno nuevo, con los frames disponibles
      }
    },

    kill: function () //function created, but IT's NOT detected as Dead!!
    {
        this.setActive(false);		//Kill it
        this.setVisible(false);
        this.body.stop();		//Stop the movement of the body, but can collide! Then body.reset(x, y) to start again
    }

  });

//HERE START SCENE
//INGAME SCENE
class InGame extends Phaser.Scene {

  constructor ()
  {
      super({ key: 'InGame', active: false });
  }

  preload() {

  }
   
  create() {

    createInGameObjects.call(this);
    createInGameZones();  //Depends on pot.body!!

    setColliders.call(this);

    //var graphics = this.add.graphics();
    //graphics.strokeRect((WIDTH-pot.body.width)/2, HEIGHT-32, pot.body.width, 32).setDepth(5);

    //Control de Teclado
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyFire = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);  //keyboard.addKeys('W,S,A,D')

    //SET Animations
    setAnimations.call(this);

    //SET Sounds
    setSounds.call(this);

    //Add Listeners
    rat.on('animationcomplete', animComplete, this) //Check Animations

    //SET Particles
    setParticles.call(this);

    this.input.gamepad.on('down', function (pad, button, index) {
      if (pad.getAxisTotal() < 4) {
      }
      else {
          pad.setAxisThreshold(0.3);
          gamepad = pad;
      }
    }, this);

    debugText = this.add.text(WIDTH-100, HEIGHT-100, '', { font: '16px Courier', fill: '#00ff00' });
  }
   
  update(time) {

    /*
    debugText.setText([
      'Level ' + gameLevel,
      rat.state,
      rat.body.velocity.x,
      rat.body.angularVelocity
      //gamepad.leftStick.x,
      //gamepad.rightStick.x
    ]);
    */

    if(lifeLeft > 0){
      //Check Movement
      checkMovement.call(this)

      //Check Fire
      checkFire.call(this, time);
    }

    //Update Animations
    updateAnimation();

    //Check Next Level
    if(levelReady && ((gamepad && gamepad.B)|| this.keyFire.isDown)){
      levelReady = false;
      iniLevel.call(this);
    }

  }
}
//Scene Controller
//https://labs.phaser.io/edit.html?src=src/scenes/tutorial/scene%20controller.js
class UIScene extends Phaser.Scene {

  constructor ()
  {
      super({ key: 'UIScene', active: false });
  }

  preload() {

  }

  create ()
  {
      //Convert Recept to Images
      receptItems = this.add.group(); 

      rightTopText = this.add.bitmapText(WIDTH-200, 10, 'gem', 'Press Fire');
      centerText = this.add.bitmapText(WIDTH/2, HEIGHT/2, 'gem', '');
      centerText.setScale(2).setVisible(false);

      /*
      rightTopText.alpha=0;
      this.tweens.add({
        targets: rightTopText,
        alpha: 1,
        duration: 200,
        ease: 'Power2',
        repeat: -1,
        yoyo: true,
        hold: 1000
      });
      */

      //  Grab a reference to the Game Scene
      let ourGame = this.scene.get('InGame');
      ourGame.events.on('checkRecept', checkUpdateRecept, this);
    
      this.scene.launch('InGame');
  }
}

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
    progressBox.fillRect(240, 270, 320, 50);

    this.load.on('progress', function (value) {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      //progressBar.fillRect(0, 270, 800 * value, 60);
      progressBar.fillRect(250, 280, 300 * value, 30);
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
    //We can add some kind of "Press Start"
    this.scene.start('UIScene');  //Better than launch
  }
}

var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  pixelArt: true, //scale is NOT interpolated
  width: 800,
  height: 600,
  input: {
    gamepad: true //Important to use the Gamepad!!
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 200 }
    }
  },
  scene: [LoadScene, InGame, UIScene] //The order is Important to define the Z-Index!
};
 
var game = new Phaser.Game(config);

function createInGameZones(){
  spaceLaunch = new Phaser.Geom.Rectangle(-32, -32, WIDTH + 32, 0); //Espacio de lanzamiento de Ingredientes
  spaceInGame = new Phaser.Geom.Rectangle(0, 0, WIDTH, HEIGHT); //Espacio de juego
  spaceInPot = new Phaser.Geom.Rectangle((WIDTH-pot.body.width)/2, HEIGHT-32,  pot.body.width, 32*2); //Espacio de Score
}

function createInGameObjects(){
  bullets = this.physics.add.group({
    classType: Bullet,
    maxSize: 30,  //Max array of bullets simultaneously after that are replaced...
    runChildUpdate: true  //Execute during the update, the update function of the Childs
  });

  //The array is empty till we don't populate it with .get()
  ingredients = this.physics.add.group({
    classType: Ingredient,
    //maxSize: 37,  //Max array of bullets simultaneously after that are replaced...
    runChildUpdate: true  //Execute during the update, the update function of the Childs
  });

  this.add.tileSprite(WIDTH/2, HEIGHT/2, WIDTH, HEIGHT, 'background');

  //We add pot as Static!
  pot = this.physics.add.staticImage(WIDTH/2, HEIGHT, 'pot').setDepth(1);  //Not important the position
  this.add.image(WIDTH/2, HEIGHT, 'potFront').setDepth(3);

  pot.setSize(pot.width*0.7, 50);
  pot.setOffset(pot.width*0.15, 50); //0.15 = (1 - 0.5)/2 
  //pot.setScale(1.5);  //Don't change the Body acordingly!!

  potSides = this.physics.add.staticGroup();
  potSides.create(((WIDTH-pot.body.width)/2)-20, HEIGHT-100, '') //left Side
  potSides.create(((WIDTH+pot.body.width)/2)+20, HEIGHT-100, '') //right Side

  potSides.children.iterate(function (child) {
    child.setSize(child.width*0.6, 30);
    child.setOffset(child.width*0.2, 0); //0.1 = (1 - 0.8)/2 
    child.setVisible(false);  //para no verlo
  });

  water = this.add.sprite(WIDTH/2, pot.body.y+20, 'water').setDepth(2).setScale(0.75).setAlpha(0.8);
  
  rat = this.physics.add.sprite(0, 0, 'rat', 14).setDepth(4).setScale(4);;  //Not important the position
  rat.setGravity(0, 900);
  rat.setPosition(WIDTH/2, HEIGHT/2); //HEIGHT-rat.body.height/2
  setObjectBody(rat, 1/3);  //adjust size of the body
}

function setColliders(){
  this.physics.add.collider(potSides, ingredients, hitPotSide, checkItem, this)
  //this.physics.add.overlap(bullets, ingredients, hitItem, checkBulletVsItem, this);
  this.physics.add.collider(bullets, ingredients, hitItem, checkBulletVsItem, this);
  this.physics.add.overlap(pot, ingredients, hitWater, checkItem, this);
  
  rat.setCollideWorldBounds(true);
}

function checkMovement(){
  //Check Keyboard
  if (this.cursors.left.isDown) {
    //rat.setAngularVelocity(-300);
    rat.setVelocityX(-300);
  } else if (this.cursors.right.isDown){
    //rat.setAngularVelocity(300);
    rat.setVelocityX(300);
  } else if (this.cursors.left.isUp || this.cursors.right.isUp) {
    //rat.setAngularVelocity(0);
    rat.setVelocityX(0);
  }

  if(this.cursors.up.isDown && (rat.y == HEIGHT-64)) {
    console.log(rat.body.touching);
    rat.setVelocityY(-400);
  }

  //Check Gamepad
  //Hasta que no pulse el gamepad NO empezamos con el ciclo Update!
  if (gamepad) { 
    rat.setVelocityX(300 * gamepad.leftStick.x);
    rat.setAngularVelocity(300 * gamepad.rightStick.x);   //We can change the Angle! :)
  }
}

function checkFire(time){
  if (time > lastFired){
    if((gamepad && gamepad.A) || this.keyFire.isDown){
      var bullet = bullets.get(); //https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Group.html#get__anchor
      if (bullet){
          swingHighFX.play();
          bullet.fire(rat);
          lastFired = time + delayFire;
      }
    }
  }
}

function setParticles(){
  dropSplash = this.add.particles('drop').setDepth(2);

  dropSplash.createEmitter({
    angle: { min: 200, max: 340, steps: 10 },
    lifespan: 1000,
    speed: { min: 50, max: 250 }, //we can set it later
    quantity: 10,
    accelerationY: 200, //Gravity
    scale: { start: 0.1, end: 0 },
    rotate: { min: 135, max: 225 },
    //tint: soupTint,   //<--How To set afterwards
    on: false
  });
}

function setSounds(){
  impactFX = this.sound.add('impact');
  impactPotFX = this.sound.add('impactPot');
  splashFX = this.sound.add('splash');
  swingBassFX = this.sound.add('swingBass', {
    volume: 0.8
  });
  swingHighFX = this.sound.add('swingHigh');
  boilingFX = this.sound.add('boiling',{
    volume: 0.5,
    rate: 0.1,
    loop: true
  });
  wrongItemFX = this.sound.add('wrong');
  rightItemFX = this.sound.add('collect');
  gasIgnitionFX = this.sound.add('gasIgnition');
  musicSound = this.sound.add('musicInGame',{
    volume: 0.7,
    loop: true
  }); 
  completeFX = this.sound.add('complete');
}
  function setAnimations(){
    //Animation --> Phaser supports flipping sprites to save on animation frames
    this.anims.create({
      key: 'boilWater',
      frames: this.anims.generateFrameNumbers('water', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1  //tells the animation to loop
    }, this);

    //COMMON ANIMATIONS
    let keys = ['idle', 'gesture', 'walk', 'attack', 'death'];
    let repeats = [-1, -1, -1, 0, 0];
      
    for(let i = 0; i < keys.length; i++){
        this.anims.create({
          key: keys[i],
          frames: this.anims.generateFrameNumbers('rat', { start: 0+(i*10), end: 9+(i*10) }),
          frameRate: 10,
          repeat: repeats[i]
        });
    }

    //Transition Animations
    keys = ['standUp', 'idleUp', 'sitDown'];
    let frames = [{start: 12, end: 13},{start: 14, end: 17},{start: 18, end: 19}]
    repeats = [0,-1,0];
      
    for(let i = 0; i < keys.length; i++){
        this.anims.create({
          key: keys[i],
          frames: this.anims.generateFrameNumbers('rat', { start: frames[i].start, end: frames[i].end }),
          frameRate: 5,
          repeat: repeats[i]
        });
    }
  }

  function animComplete (animation, frame){
    //  Animation is over, let's fade the sprite out
    //console.log('Anim: ' + animation.key);
    rat.state = animation.key;
  }
  function updateAnimation(){
    //https://labs.phaser.io/index.html?dir=animation/&q=

    //play(key [, ignoreIfPlaying] [, startFrame])
    if(lifeLeft <= 0){
      //We should add also play('death')
      return;
    }

    if(rat.body.velocity.x == 0 && rat.body.velocity.y == 0){ //added .y when we jump
      //If don't walk
      switch(rat.state) {
        case 'walk':
          rat.anims.play('standUp', false);
          break;
        case 'standUp':
          rat.anims.play('idleUp', true);
          break;
        default:
          rat.anims.play('idleUp', true);
      } 
    } 
    else {
      //If walk
      switch(rat.state) {
        case 'idleUp':
          rat.anims.play('sitDown', false);
          break;
        case 'sitDown':
          rat.anims.play('walk', true);
          break;
        default:
          rat.anims.play('walk', true);
      } 
    }

    //Flip Frame if necessary
    if(rat.body.velocity.x > 0){
      rat.flipX = true;
    } else if(rat.body.velocity.x < 0) {  //We use it, in order to don't turn when 0
      rat.flipX = false;
    }
  }

  function addIngredient(frame){

    //getFirst( [state],...   active state == state
    //getFirstDead(false,...  active state == false
    //getFirstAlive(true,...  active state == true
    //get()                   active state == false, if not --> create with the arguments
    var pStart = new Phaser.Math.Vector2();  //Inicializamos vector (x: 0, y:0)
    spaceLaunch.getRandomPoint(pStart);  //Fijamos punto aleatorio dentro de rectangulo
    item = ingredients.get(pStart.x, pStart.y, 'fruits', frame);  //Unless a new member is created, key, frame, and visible are ignored.
    if(item){
      swingBassFX.play();
      item.launch();
    }
  }

  function defineLevelFrames(){
      //Añadimos la receta correcta
      var availableLevelFrames = [];
      for (var i = 0; i < numberReceptItems; i++){
        availableLevelFrames.push(receptItemsArray[i].frame)
      }
  
      //Añadimos más ingredientes incorrectos.
      for (var i = 0; i < numberScreenItems-numberReceptItems; i++){
        let ingredientFrame = Phaser.Math.Between(0, 36) //Phaser.Math.Between(0, 36); //getChildren
  
        //If we want diferent Ingredients, we can repeat the ReceptItems using < numberReceptItems instead <0
        if(availableLevelFrames.indexOf(ingredientFrame) < numberReceptItems )   { //If NOT found --> -1
          availableLevelFrames.push(ingredientFrame)
        } else{ i--; }
      }
  
      //Shuffle Array
      shuffle(availableLevelFrames);

      return availableLevelFrames;
  }

  function launchIngredients(frames){

    //We add every item after a delay
    for (var i = 0; i < numberScreenItems; i++) {
      (function (i) {
        setTimeout(function () {
          addIngredient(frames[i]);  //we have to add those functions to scence!!
         }, delayItems*i);
        })(i);
    };
  }

  function clearScreenItems(){

    this.tweens.add({
      targets: ingredients.getChildren(),
      alpha: 0,
      duration: 200,
      delay: 0,  //time to start action
      onComplete: function () { 
        ingredients.clear(true, true); 
      }    //clear( [removeFromScene] [, destroyChild])
    });
  
  }

  function checkBulletVsItem (bullet, item)  {
    return (bullet.active && item.active);
  }

  function checkItem(pot, item){ return item.active; }

  function hitItem (bullet, item)
  {
    //xparticles.emitParticleAt(item.x, item.y);
    //this.cameras.main.shake(500, 0.01);

    impactFX.play();

    item.setAngularVelocity(Phaser.Math.Between(-500, 500));
    bullet.setAngularVelocity(Phaser.Math.Between(-500, 500));

    //To avoid 
    let rndVelocityX = Phaser.Math.Between(-50, 50);
    item.setVelocityX(item.body.velocity.x + rndVelocityX);
    bullet.setVelocityX(item.body.velocity.x - rndVelocityX);

    //If we want to deactivate the hitted items
    //bullet.kill();
    //item.kill();
  }

  function hitPotSide (side, item){
    //Y: -0.7692307692307693 X: 0.02864176356123963 Speed: 2.564262527483729
    //Always speed is <0 
    if(item.body.velocity.y > -1){  //
      //console.log('Y: ' + item.body.velocity.y + ' X: ' + item.body.velocity.x + ' Speed: ' + item.body.speed)
      if(item.body.x < side.body.x+side.body.width/2){
        //ROll to the left
        item.setVelocityX(-5);
        item.setAngularVelocity(-50);
      }
      else{
        //ROll to the right
        item.setVelocityX(5);
        item.setAngularVelocity(50);
      }
    } 
    else{
      item.setAngularVelocity(Phaser.Math.Between(-500, 500));
      impactPotFX.play();
    }
  }
  
  function hitWater (pot, item) {

    if(item.body.touching.right || item.body.touching.left){
      item.setVelocityX(0);
      item.setVelocityY(0); //With negative we can simulate a little jump
      item.setAngularVelocity(Phaser.Math.Between(-100, 100));

      dropSplash.emitParticleAt(item.x, item.y);
      splashFX.play();
    }
  }

  function setObjectBody(object, widthRatio = 2/3, heightRatio = widthRatio){
    
    var bodyW = Math.floor(object.width*widthRatio);
    var bodyH = Math.floor(object.height*heightRatio);
    var bodyOffX = Math.floor((object.width-bodyW)/2);
    var bodyOffY = Math.floor((object.width-bodyH));  //0;
    
    object.setSize(bodyW, bodyH);  //Size of the Body
    object.setOffset(bodyOffX,bodyOffY); //(frame-size)/2, frame-size - Pan
  
  }

  function createRecept(){
    //Ajustamos dificultad según GameLevel
    //Cada 3 niveles añadimos un elemento más
    if((numberReceptItems < 5) && (gameLevel % 5 ==0)){
      numberReceptItems +=1;
      numberScreenItems = 2*numberReceptItems;
    }
    //El número de items aumenta
    MaxSameItems = Math.log2(gameLevel) + 3 - numberReceptItems ;

    //Create a new Recept
    for (let i=0; i<numberReceptItems; i++){  
      var receptItem = {frame: Phaser.Math.Between(0, 36), number: Phaser.Math.Between(1, MaxSameItems)};
      if(findObjectByKey(receptItemsArray, 'frame', receptItem.frame)){
        i--;  //We try again
      } else{
        receptItemsArray.push(receptItem);
      }
    }

    for (let i=0; i<receptItemsArray.length; i++){
      let container = this.add.container(0, 0);
      container.add(this.add.image(32 , 25, 'fruits', receptItemsArray[i].frame));
      container.add(this.add.bitmapText(32+16, 10, 'gem', 'x' + receptItemsArray[i].number));
      receptItems.add(container);
    }
    //  Spread out the children between the 2 given values, using the string-based property
    Phaser.Actions.Spread(receptItems.getChildren(), 'x', 0, (32+16)*2*receptItems.getLength());
  }

  function clearRecept(){
    receptItemsArray = [];
  
    this.tweens.add({
      targets: receptItems.getChildren(),
      alpha: 0,
      duration: 200,
      delay: 0,  //time to start action
      onComplete: function () { 
        receptItems.clear(true, true);
        levelReady = true;
      }    //clear( [removeFromScene] [, destroyChild])
    });
    //removeAll( [destroyChild])  //to clear the container
  }

  function checkUpdateRecept (item) {
    var badItem = true;
    var receptFinished = true;
    var containerItem, containerImage, containerText;

    receptItemsArray.forEach(function(child, id){
      //Check Item in Pot
      if(item.frame.name == child.frame){
        badItem = false;
        child.number -= 1;

        containerItem = receptItems.getChildren()[id].getAll()
        containerImage = containerItem[0];  //can we use simply get();??
        containerText = containerItem[1];

        highlightObject.call(this, containerImage);
        rightItemFX.play();

        if(child.number<0){
          child.number = 0;
          containerText.setTint(0xff0000);  //tint red the score!
          setTimeout(function() { containerText.clearTint();}, 200); //Clear Tint after 200ms
        } 
        
        containerText.setText('x' + child.number);
      } 
      //Check Recept Finished
      if(child.number != 0){
        receptFinished = false;
      }
    }, this);

    //Update Life/Status
    if(badItem){
      wrongItem.call(this);
    } else if(receptFinished) {
      nextLevel.call(this);
    }
  }

  function clearLevel(){
    console.log('ClearLevel Called!')
    //Must to be called with .call(this)
    clearScreenItems.call(this);  //Paso argumento this
    clearRecept.call(this);

  }

  function iniLevel(){

    //Tweens INI  --> https://photonstorm.github.io/phaser3-docs/Phaser.Tweens.TweenManager.html
    //this.tweens.killAll();  //Stops all Tweens NOT finished!

    //Sound INI
    musicSound.play('',{
      rate: 1,
      delay: 2
    });

    gasIgnitionFX.play();
    soundFadeIn.call(this, boilingFX, 2000, undefined, 0.7) //OJO, play por defecto!
    soundSpeedUp.call(this,boilingFX, 2000)

    //Sprites INI
    water.clearTint();
    //Ini Animations
    rat.anims.play('standUp', true);
    water.anims.play('boilWater', true);

    //animSpeedUp.call(this, water.anims, 'boilWater', 2000)

    //For debugging      
    lifeLeft = 5;
    rightTopText.setText('Lifes x' + lifeLeft)

    createRecept.call(this);
    levelFrames = defineLevelFrames();
    ingredients.maxSize = levelFrames.length;

    //Show Recept and after it launch ingredients.
    showRecept.call(this);
  }

  function showRecept(){
    let scale = 2;
    let showItemsTime = 1500;
    let spaceStepX = WIDTH/numberReceptItems;
    
    centerText.setText('Recept #' + gameLevel);
    centerText.setOrigin(0.25, 0.5).setVisible(true);

    this.tweens.add({
      targets: receptItems.getChildren(),
      x: { value: {
        getEnd: function (target, key, value){
          return target.x*scale + spaceStepX/2; 
        }
      }, duration: showItemsTime, ease: 'Power2' },            //Power1, Power2, Bounce.easeOut
      y: { value: {
        getEnd: function (target, key, value){
          return target.y + HEIGHT/4;
        }
      }, duration: showItemsTime, ease: 'Power2' },
      scaleX: { value: scale, duration: showItemsTime, ease: 'Power2' },
      scaleY: { value: scale, duration: showItemsTime, ease: 'Power2' },
      yoyo: true,
      hold: 500,
      onComplete: function () {
        //setText 
        launchIngredients(levelFrames); 
        centerText.setVisible(false);
      }
    });
  }

  function nextLevel(){
    //https://labs.phaser.io/edit.html?src=src/physics/arcade/restart%20physics%20scene.js
    //rightTopText.setText('Recept Complete!');

    //Sound
    soundFadeOut.call(this, boilingFX, 2000)
    soundSlowDown.call(this, boilingFX, 2000)
    musicSound.stop();
    completeFX.play();

    //Animation
    animSlowDown.call(this, water.anims, 1000);    //<-- is this working?

    centerText.setText('Recept Complete!').setVisible(true);

    //Depending on Recept, Tint different.
    water.setTint(Math.random() * (0xFFFFFF-soupTint) + soupTint);  //Random Tint
    //dropSplash.tint = soupTint;

    gameLevel +=1;

    clearLevel.call(this);  //Here Inside set     levelReady = true;
  }

  function gameOver(){

    soundSlowDown.call(this, musicSound, 2000)
    soundFadeOut.call(this, boilingFX, 2000)

    rightTopText.setText('Game Over!');
    rat.setVelocityX(0);
    rat.anims.play('death', false);

    //Reset Values
    gameLevel = 1;  //we set the numberScreenItems and numberReceptItems depending on it.
    numberReceptItems = 2; //Recept, depending on the Level
    MaxSameItems = 2; //Max Number Items per Ingredient in Recept
    numberScreenItems = 2*numberReceptItems; //Simultaneous, depending on the Level

    clearLevel.call(this);  //Here Inside set     levelReady = true;
  }

  function wrongItem(){

    wrongItemFX.play();
    //Bad Item :(
    lifeLeft -= 1;
    if(lifeLeft == 0){    //To force Only 1 Time GameOver
      gameOver.call(this);
    } else if(lifeLeft<0){
      lifeLeft = 0;
    }
    else{
      rightTopText.setText('Lifes x' + lifeLeft)
      highlightObject.call(this, rightTopText, 1.5);
      rightTopText.setTint(0xff0000);  //tint red the score!
      setTimeout(function() { rightTopText.clearTint();}, 200); //Clear Tint after 200ms
    }
  }

  function highlightObject(objectToHighlight, scaleX = 2, scaleY = scaleX, duration = 200){
    //Reset Scale
    this.tweens.killTweensOf(objectToHighlight);  //killTweensOf(objectToHighlight)
    objectToHighlight.setScale(1);

    this.tweens.add({
      targets: objectToHighlight,
      scaleX: scaleX,
      scaleY: scaleY,
      ease: 'Sine.easeInOut',
      duration: duration,
      //delay: i * 50,
      repeat: 0,
      yoyo: true
      //repeatDelay: 500
    });
  }

  //HELPER
  function animSpeedUp(animation, key, duration = 500, iniRate = animation.frameRate, endRate = 10, onStartPlay = true){
    //https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Components.Animation.html#toc0__anchor
    animation.frameRate = iniRate;
    this.tweens.add(
      { targets: animation,
          frameRate: endRate,
          duration: duration,
          //ease: 'Sine.easeInOut',
          onStart: function () {
            if(onStartPlay) animation.play(key);
          }
      });
    
  }

  function animSlowDown(animation, duration = 500, iniRate = animation.frameRate, endRate = 2, onCompleteStop = true){
    //https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Components.Animation.html#toc0__anchor
    animation.frameRate = iniRate;
    this.tweens.add(
      { targets: animation,
          frameRate: endRate,
          duration: duration,
          //ease: 'Sine.easeInOut',
          onComplete: function () {
            if(onCompleteStop){  //levelReady
              animation.restart();
              animation.stop();
            }
          }
      });
  }

  function soundFadeIn(sound, duration = 500, iniVolume = sound.volume, endVolume = 1, onStartPlay = true){
    sound.setVolume(iniVolume);
    this.tweens.add(
      { targets: sound,
          volume: endVolume,
          duration: duration,
          //ease: 'Sine.easeInOut',
          onStart: function () {
            sound.soundIn = onStartPlay;
            if(onStartPlay) sound.play();
          },
          onComplete: function () {
            sound.soundIn = false;
          }
      });
  }

  function soundFadeOut(sound, duration = 500, iniVolume = sound.volume, endVolume = 0, onCompleteStop = true){
    sound.setVolume(iniVolume);
    this.tweens.add(
      { targets: sound,
          volume: endVolume,
          duration: duration,
          //ease: 'Sine.easeInOut',
          onComplete: function () {
            if(onCompleteStop && !sound.soundIn) sound.stop(); 
          }
      });
  }

  function soundSlowDown(sound, duration = 500, iniRate = sound.rate, endRate = 0.1, onCompleteStop = true){
    sound.setRate(iniRate);
    this.tweens.add(
      { targets: sound,
          rate: endRate,
          duration: duration,
          //ease: 'Sine.easeInOut',
          onComplete: function () {
            if(onCompleteStop && !sound.soundIn) sound.stop();
          }
      });
  }

  function soundSpeedUp(sound, duration = 500, iniRate = sound.rate, endRate = 1, onStartPlay = true){
    sound.setRate(iniRate);
    this.tweens.add(
      { targets: sound,
          rate: endRate,
          duration: duration,
          //ease: 'Sine.easeInOut',
          onStart: function () {
            sound.soundIn = onStartPlay;
            if(onStartPlay) sound.play();
          },
          onComplete: function () {
            sound.soundIn = false;
          }
      });
  }


  function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
  }

  /**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }