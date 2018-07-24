//Ejemplo de aparecer y desaparecer objetos
//https://labs.phaser.io/edit.html?src=src/game%20objects/group/sprite%20pool.js

//INGAME SCENE
class GameScene extends Phaser.Scene {

  constructor ()
  {
      super({ key: 'GameScene', active: false });
  }

  preload() {

  }
   
  create() {

    //SET Screen Objects
    createInGameObjects.call(this);
    createGameInfo.call(this);    //The order of the elements creation is important for Z-Index. Last element is in Upper Layer.
    createInGameZones();          //Depends on pot.body!!

    setColliders.call(this);

    //var graphics = this.add.graphics();
    //graphics.strokeRect((WIDTH-pot.body.width)/2, HEIGHT-32, pot.body.width, 32).setDepth(5);

    //SET Animations
    setAnimations.call(this);

    //SET Sounds
    setSounds.call(this);

    //SET Particles
    setParticles.call(this);

    //SET Inputs
    this.cursors = this.input.keyboard.createCursorKeys();  //those are not considered listeners.
    startInputEvents.call(this);

    //SET Listeners
    rat.on('animationcomplete', animComplete, this) //Check Animations
    this.events.on('checkRecept', checkUpdateRecept, this); 

    debugText = this.add.text(WIDTH*0.85, HEIGHT*0.8, '', { font: '16px Courier', fill: '#00ff00' });
  }
   
  update(time) {

    if(DEBUG){
      debugText.setText([
        //'Level ' + gameLevel,
        rat.state,
        //rat.body.velocity.x,
        //rat.body.angularVelocity,
        rat.x,
        rat.body.x,
        //touchpoint.x
        //gamepad.leftStick.x,
        //gamepad.rightStick.x
      ]);
    }

    if(lifeLeft > 0){
      //Check Movement
      checkMovement.call(this)
      //Check Fire
      checkFire.call(this, time);
    }

    //Update Animations
    updateAnimation();

    //Check Next Level
    if(levelReady && rat.fire){
      levelReady = false;
      iniLevel.call(this);
    }

  }
}

//https://stackoverflow.com/questions/29514382/global-functions-in-javascript

//================================== CREATE FUNCTIONS ==================================//
/*
  CREATE GAME OBJECTS
  ===================
*/
function createInGameZones(){
  spaceLaunch = new Phaser.Geom.Rectangle(-32, -32, WIDTH + 32, 0); //Espacio de lanzamiento de Ingredientes
  spaceInGame = new Phaser.Geom.Rectangle(0, 0, WIDTH, HEIGHT); //Espacio de juego
  spaceInPot = new Phaser.Geom.Rectangle((WIDTH-pot.body.width)/2, HEIGHT-32,  pot.body.width, 32*2); //Espacio de Score
}

function createGameInfo(){
  //Convert Recept to Images
  receptItems = this.add.group(); 

  rightTopText.lifeText = this.add.bitmapText(WIDTH-96, 16+10, 'gem', 'Lifes x').setOrigin(0.5).setVisible(false);
  rightTopText.lifeNumber = this.add.bitmapText(rightTopText.lifeText.x + rightTopText.lifeText.width/2, rightTopText.lifeText.y, 'gem', lifeLeft).setOrigin(0, 0.5).setVisible(false);

  centerText.iniLevel = this.add.bitmapText(WIDTH/2, HEIGHT/2, 'gem', 'Recept #').setOrigin(0.5).setScale(2).setVisible(false);
  centerText.gameLevel = this.add.bitmapText(centerText.iniLevel.x + centerText.iniLevel.width/2, centerText.iniLevel.y+centerText.iniLevel.height/2, 'gem', gameLevel).setOrigin(0, 0.5).setScale(2).setVisible(false);
  centerText.winLevel = this.add.bitmapText(WIDTH/2, HEIGHT/2, 'gem', 'Recept Complete!').setOrigin(0.5).setScale(2).setVisible(false);
  centerText.lostLevel = this.add.bitmapText(WIDTH/2, HEIGHT/2, 'gem', 'Game Over!').setOrigin(0.5).setScale(2).setVisible(false);

  //The recept is NOT created here...
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

  //this.add.tileSprite(WIDTH/2, HEIGHT/2, WIDTH, HEIGHT, 'background');  //With tileSprite, the pattern is repeated.
  background = this.add.sprite(WIDTH/2, HEIGHT/2, 'background')
  if((WIDTH - background.width > HEIGHT - background.height) && (WIDTH - background.width > 0)){
    background.setScale(WIDTH/background.width);
  }
  else if((HEIGHT - background.height > WIDTH - background.width) && (HEIGHT - background.height > 0)){
    background.setScale(HEIGHT/background.height); 
  }

  //We add pot as Static!
  pot = this.physics.add.staticImage(WIDTH/2, HEIGHT, 'pot').setDepth(1);  //Not important the position
  this.add.image(WIDTH/2, HEIGHT, 'potFront').setDepth(3);

  //setObjectBody(pot, 1, 1, -1, -1);  //with this setting, is centered :(
  pot.body.setSize(pot.width*0.7, 50);
  pot.body.setOffset(pot.width*0.15, 50); //0.15 = (1 - 0.5)/2 
  //pot.setScale(1.5);  //Do Scale always after setSize! Issue  #3824

  potSides = this.physics.add.staticGroup();
  potSides.create(((WIDTH-pot.body.width)/2)-20, HEIGHT-100, '') //left Side
  potSides.create(((WIDTH+pot.body.width)/2)+20, HEIGHT-100, '') //right Side

  potSides.children.iterate(function (child) {
    child.body.setSize(child.width*0.6, 30);
    child.body.setOffset(child.width*0.2, 0); //0.1 = (1 - 0.8)/2 
    child.setVisible(false);  //para no verlo
  });

  water = this.add.sprite(WIDTH/2, pot.body.y+20, 'water').setDepth(2).setScale(0.75).setAlpha(0.8);
  
  rat = this.physics.add.sprite(WIDTH/2, HEIGHT/2, 'rat', 14).setDepth(4);  //Not important the position
  setObjectBody(rat, 1/3, 1/3, 0, 1);  //adjust size of the body
  rat.setScale(4);  //Do Scale always after setSize! Issue  #3824

  rat.setGravity(0, ratGravity);
}

function setObjectBody(object, widthRatio = 2/3, heightRatio = widthRatio, offX = 0, offY = offX){
  
  var bodyW = object.width*widthRatio;
  var bodyH = object.height*heightRatio;

  //Body by default centered on Sprite
  var bodyOffX = (offX+1)*bodyW;  //0 = centered, 1 = right, -1 = left 
  var bodyOffY = (offY+1)*bodyH;

  //Do setScale always after setSize! Issue  #3824
  object.body.setSize(bodyW, bodyH);  //Size of the Body
  object.body.setOffset(bodyOffX,bodyOffY); 
}

/*
  SET COLLIDERS
  ===================
*/
function setColliders(){
  this.physics.add.collider(potSides, ingredients, hitPotSide, checkItem, this)
  //this.physics.add.overlap(bullets, ingredients, hitItem, checkBulletVsItem, this);
  this.physics.add.collider(bullets, ingredients, hitItem, checkBulletVsItem, this);
  this.physics.add.overlap(pot, ingredients, hitWater, checkItem, this);
  
  rat.setCollideWorldBounds(true);
}

function hitItem (bullet, item)
{
  //xparticles.emitParticleAt(item.x, item.y);
  //this.cameras.main.shake(500, 0.01);

  impactFX.play();

  item.setAngularVelocity(Phaser.Math.Between((-1)*itemHitRotationMax, itemHitRotationMax));
  bullet.setAngularVelocity(Phaser.Math.Between((-1)*itemHitRotationMax, itemHitRotationMax));

  //To avoid a complitely vertical Bounce
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
      //Roll to the left
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
    item.setAngularVelocity(Phaser.Math.Between((-1)*itemHitRotationMax, itemHitRotationMax));
    impactPotFX.play();
  }
}

function hitWater (pot, item) {

  if(item.body.touching.right || item.body.touching.left){
    item.setVelocityX(0);
    item.setVelocityY(0); //With negative we can simulate a little jump
    item.setAngularVelocity(Phaser.Math.Between((-1)*itemWaterRotationMax, itemWaterRotationMax));

    dropSplash.emitParticleAt(item.x, item.y);
    splashFX.play();
  }
}

function checkBulletVsItem (bullet, item)  {
  return (bullet.active && item.active);
}

function checkItem(pot, item){ 
  return item.active; 
}

/*
  SET ANIMATIONS
  ===================
*/
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

/*
  SET SOUNDS
  ===================
*/
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

/*
  SET PARTICLES
  ===================
*/
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

/*
  SET INPUTS
  ===================
*/

function startInputEvents(){
  //https://photonstorm.github.io/phaser3-docs/Phaser.Input.InputPlugin.html#toc0__anchor
  //Cursors
  this.input.keyboard.on('keydown_SPACE', function (){ rat.fire = true; }, this );  //Better way to catch Fire

  //Gamepad
  this.input.gamepad.on('down', function (pad, button, index) { //catch every down key    
    if (pad.getAxisTotal() >= 4) {
      pad.setAxisThreshold(0.3);
      gamepad = pad;
      if(button.index == 0) { rat.fire = true; }  //if button = 'A' --> rat.fire = true; //better way to catch fire
    }
  }, this);

  //Mouse
  this.input.on('pointerdown', function (pointer) {
    touchpoint = new Phaser.Math.Vector2(pointer.x, pointer.y);   //touchpoint.set(pointer.x, pointer.y);
  }, this);

  this.input.on('pointerup', function (pointer) {
    rat.fire = true;
  }, this);
}

/*
  SET LISTENERS
  ===================
*/
function animComplete (animation, frame){
  //  Animation is over, let's fade the sprite out
  //console.log('Anim: ' + animation.key);
  rat.state = animation.key;
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

//================================== UPDATE FUNCTIONS ==================================//
/*
  CHECK VALUES
  ===================
*/
function checkMovement(){

  //Check Keyboard
  if (this.cursors.left.isDown) {
    rat.setVelocityX(-300);
  } else if (this.cursors.right.isDown){
    rat.setVelocityX(300);
  } else if (this.cursors.left.isUp || this.cursors.right.isUp) {
    rat.setVelocityX(0);
  }

  //If we are touching the Bottom of the screen, we can jump
  if((rat.body.blocked.down) && (this.cursors.up.isDown || (gamepad && gamepad.X))) {  //Check Bottom rat.y == HEIGHT-64
    //rat.jump = true;  //in the same way than rat.fire = true;
    rat.setVelocityY(-400);
  }

  //Check Gamepad
  //Hasta que no pulse el gamepad NO empezamos con el ciclo Update!
  if (gamepad) { 
    rat.setVelocityX(300 * gamepad.leftStick.x);
    rat.setAngularVelocity(300 * gamepad.rightStick.x);   //We can change the Angle! :)
  }

  //Check Touchpoint  --> Still to debug
  if(touchpoint) {
    if(rat.x < (touchpoint.x - rat.width/8)){ //Move to the Right
      rat.setVelocityX(300);
      rat.fire = false;
    } else if(rat.x > (touchpoint.x + rat.width/8)){ //Move to the Left
      rat.setVelocityX(-300);
      rat.fire = false;     //If we are moving, we consider we didn't want to fire
    } else{
      rat.setVelocityX(0);
      //nothing to do
    }
  }
}

function checkFire(time){
  //Better define a Fire Variable

  if (time > lastFired){
    if(rat.fire && !levelReady){
      rat.fire = false;
      var bullet = bullets.get(); //https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Group.html#get__anchor
      if (bullet){
          swingHighFX.play();
          bullet.fire(rat);
          lastFired = time + delayFire;
      }
    }
  }
}
/*
  UPDATE ANIMATIONS
  ===================
*/
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


//================================== GAME HELPERS ==================================//
/*
  INGREDIENTS
  ===================
*/
function setIngredientsFrames(){
  //Añadimos la receta correcta
  var availableItemsFrames = [];
  for (var i = 0; i < numberReceptItems; i++){
    availableItemsFrames.push(receptItemsArray[i].frame)
  }

  //Añadimos más ingredientes incorrectos.
  for (var i = 0; i < numberScreenItems-numberReceptItems; i++){
    let ingredientFrame = Phaser.Math.Between(0, framesNumber-1) //Phaser.Math.Between(0, framesNumber-1); //getChildren

    //If we want diferent Ingredients, we can repeat the ReceptItems using < numberReceptItems instead <0
    if(availableItemsFrames.indexOf(ingredientFrame) < numberReceptItems )   { //If NOT found --> -1
      availableItemsFrames.push(ingredientFrame)
    } else{ i--; }
  }

  //Shuffle Array
  shuffle(availableItemsFrames);

  return availableItemsFrames;
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

function launchIngredients(frames){

  /*
  //With time Event <-- There is a Problem with this scope, we came from another function...
  let i = 0;
  this.time.addEvent({ delay: delayItems, callback: function() {
    addIngredient(frames[i]);
    i++;
  }, callbackScope: this, repeat: numberScreenItems });
  */

  //We add every item after a delay
  for (var i = 0; i < numberScreenItems; i++) {
    (function (i) {
      setTimeout(function () {
        addIngredient(frames[i]);  //we have to add those functions to scence!!
        }, delayItems*i);
      })(i);
  };
}

function clearIngredients(){
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

/*
  RECEPT
  ===================
*/
function createRecept(){
  //Ajustamos dificultad según GameLevel
  //Cada 3 niveles añadimos un elemento más
  if((numberReceptItems < 5) && (gameLevel % 5 ==0)){
    numberReceptItems +=1;
    numberScreenItems = 2*numberReceptItems;
  }
  //El número de items aumenta
  sameItemsReceptMax = Math.log2(gameLevel) + 3 - numberReceptItems ;

  //Create a new Recept
  for (let i=0; i<numberReceptItems; i++){  
    var receptItem = {frame: Phaser.Math.Between(0, framesNumber-1), number: Phaser.Math.Between(1, sameItemsReceptMax)};
    if(findObjectByKey(receptItemsArray, 'frame', receptItem.frame)){
      i--;  //We try again
    } else{
      receptItemsArray.push(receptItem);
    }
  }

  for (let i=0; i<receptItemsArray.length; i++){
    let container = this.add.container(0, 0);
    container.add(this.add.image(32 , 16+10, 'fruits', receptItemsArray[i].frame));
    container.add(this.add.bitmapText(32+16, 10, 'gem', 'x' + receptItemsArray[i].number));
    receptItems.add(container);
  }
  //  Spread out the children between the 2 given values, using the string-based property
  Phaser.Actions.Spread(receptItems.getChildren(), 'x', 0, (32+16)*2*receptItems.getLength());
}

function showRecept(){
  let scale = 2;
  let showItemsTime = 1500;
  let spaceStepX = WIDTH/numberReceptItems;
  
  centerText.lostLevel.setVisible(false);
  centerText.winLevel.setVisible(false);
  centerText.iniLevel.setVisible(true); //BUG! When we change the Text the position also changes
  centerText.gameLevel.setText(gameLevel).setVisible(true);

  this.tweens.add({
    //Bug depending on the WIDTH!!
    targets: receptItems.getChildren(),
    x: { value: {
      getEnd: function (target, key, value){
        return spaceStepX/2 + target.x*scale;   //Revisar
      }
    }, duration: showItemsTime, ease: 'Power2' },            //Power1, Power2, Bounce.easeOut
    y: { value: {
      getEnd: function (target, key, value){
        return centerText.iniLevel.y/2 /*- target.y*/; 
      }
    }, duration: showItemsTime, ease: 'Power2' },
    scaleX: { value: scale, duration: showItemsTime, ease: 'Power2' },
    scaleY: { value: scale, duration: showItemsTime, ease: 'Power2' },
    yoyo: true,
    hold: 500,
    onComplete: function () {
      //setText 
      launchIngredients(ingredientsFrames); 
      centerText.iniLevel.setVisible(false);
      centerText.gameLevel.setVisible(false);
    }
  });
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

/*
  LEVEL
  ===================
*/
function iniLevel(){

  //Tweens INI  --> https://photonstorm.github.io/phaser3-docs/Phaser.Tweens.TweenManager.html
  //this.tweens.killAll();  //Stops all Tweens NOT finished!

  //Sound INI
  musicSound.play('',{    //After GameOver the sound is in a Tween!
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
  lifeLeft = lifeIni;
  rightTopText.lifeText.setVisible(true);
  rightTopText.lifeNumber.setText(lifeLeft).setVisible(true);

  createRecept.call(this);
  ingredientsFrames = setIngredientsFrames();
  ingredients.maxSize = ingredientsFrames.length;

  //Show Recept and after it launch ingredients.
  showRecept.call(this);
}

function nextLevel(){
  //https://labs.phaser.io/edit.html?src=src/physics/arcade/restart%20physics%20scene.js

  //Sound
  soundFadeOut.call(this, boilingFX, 2000)
  soundSlowDown.call(this, boilingFX, 2000)
  musicSound.stop();
  completeFX.play();

  //Animation
  animSlowDown.call(this, water.anims, 1000);    //<-- is this working?

  centerText.winLevel.setVisible(true);  //every Time we change text it changes position!

  //Depending on Recept, Tint different.
  water.setTint(Math.random() * (0xFFFFFF-soupTint) + soupTint);  //Random Tint
  //dropSplash.tint = soupTint;

  gameLevel +=1;

  clearLevel.call(this);  //Here Inside set     levelReady = true;
}

function gameOver(){

  soundSlowDown.call(this, musicSound, 2000)
  soundFadeOut.call(this, boilingFX, 2000)

  centerText.lostLevel.setVisible(true);
  rat.setVelocityX(0);
  rat.anims.play('death', false);

  //Reset Values
  gameLevel = 1;  //we set the numberScreenItems and numberReceptItems depending on it.
  numberReceptItems = 2; //Recept, depending on the Level
  sameItemsReceptMax = 2; //Max Number Items per Ingredient in Recept
  numberScreenItems = 2*numberReceptItems; //Simultaneous, depending on the Level

  clearLevel.call(this);  //Here Inside set     levelReady = true;
}

function clearLevel(){
  console.log('ClearLevel Called!')
  //Must to be called with .call(this)
  clearIngredients.call(this);  //Paso argumento this
  clearRecept.call(this);

}

/*
  OTHERS
  ===================
*/

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
    rightTopText.lifeNumber.setText(lifeLeft);
    highlightObject.call(this, rightTopText.lifeNumber, 1.5);
    rightTopText.lifeText.setTint(0xff0000);  //tint red the score!
    rightTopText.lifeNumber.setTint(0xff0000);  //tint red the score!
    setTimeout(function() { 
      rightTopText.lifeText.clearTint();
      rightTopText.lifeNumber.clearTint();
    }, 200); //Clear Tint after 200ms
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

//================================== GLOBAL HELPERS ==================================//
/*
  ANIMATIONS
  ===================
*/
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

/*
  SOUND
  ===================
*/
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

/*
  EVENTS
  ===================
*/

function stopInputEvents(){
  //When we don't want react to an input.
  //this.input.off('gameobjectover', this.onIconOver);
  this.input.removeAllListeners();
}

/*
  ARRAYS
  ===================
*/
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