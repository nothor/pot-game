//Examples  --> https://github.com/ignacioxd/ragin-mages/blob/master/game/src/js/objects/Character.js
//let remotePlayer = new Character(this, x, y, character, handle);
/*
export default class Character extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, handle = null, options = {}) {
    super(scene, x, y, key);
  }
}
*/

//Extracted Player as a Class for rat
//var rat = this.add.existing(new Player(this, WIDTH/2, HEIGHT/2, 'rat', 14, 4));
class Player extends Phaser.Physics.Arcade.Sprite {  //new Phaser.Class(
    constructor(scene, x, y, key, frame, scale = 1) {    //Arguments
      super(scene, x, y, key, frame); //new Sprite(scene, x, y, texture [, frame])
        
      //Here we enable the body!
      scene.physics.world.enable(this);
      
      this.setDepth(4);
      this.setObjectBody(1/3, 1/3, 0, 1);  //adjust size of the body
      this.setScale(scale);  //Do Scale always after setSize! Issue  #3824
      this.setGravity(0, ratGravity);

      this.fire = false;
      this.jump = false;
      this.state = null;
      this.lifeLeft = lifeIni;

      //SET Listeners
      this.on('animationcomplete', this.animComplete, this.scene) //Check Animations
    }

    update(time){
      if(this.lifeLeft > 0){
          //Check Movement
          this.checkMovement();
          //Check Fire
          this.checkFire(time);
      }
    
      //Update Animations
      this.updateAnimation();
    }

    setObjectBody (widthRatio = 2/3, heightRatio = widthRatio, offX = 0, offY = offX){
  
      var bodyW = this.width*widthRatio;
      var bodyH = this.height*heightRatio;
    
      //Body by default centered on Sprite
      var bodyOffX = (offX+1)*bodyW;  //0 = centered, 1 = right, -1 = left 
      var bodyOffY = (offY+1)*bodyH;
    
      //Do setScale always after setSize! Issue  #3824
      this.body.setSize(bodyW, bodyH);  //Size of the Body
      this.body.setOffset(bodyOffX,bodyOffY); 
    }

    setColliders(){
      this.setCollideWorldBounds(true);
    }

    animComplete (animation, frame){
        //  Animation is over, let's fade the sprite out
        //console.log('Anim: ' + animation.key);
        this.state = animation.key;
    }

    checkMovement(){
      //Check Keyboard
      if (this.scene.cursors.left.isDown) {
        this.setVelocityX(-300);
      } else if (this.scene.cursors.right.isDown){
        this.setVelocityX(300);
      } else if (this.scene.cursors.left.isUp || this.scene.cursors.right.isUp) {
        this.setVelocityX(0);
      }
    
      //If we are touching the Bottom of the screen, we can jump
      if((this.body.blocked.down) && (this.scene.cursors.up.isDown || (gamepad && gamepad.X))) {  //Check Bottom this.y == HEIGHT-64
        //this.jump = true;  //in the same way than this.fire = true;
        this.setVelocityY(-400);
      }
    
      //Check Gamepad
      //Hasta que no pulse el gamepad NO empezamos con el ciclo Update!
      if (gamepad) { 
        this.setVelocityX(300 * gamepad.leftStick.x);
        this.setAngularVelocity(300 * gamepad.rightStick.x);   //We can change the Angle! :)
      }
    
      //Check Touchpoint  --> Still to debug
      if(touchpoint) {
        if(this.x < (touchpoint.x - this.width/8)){ //Move to the Right
          this.setVelocityX(300);
          this.fire = false;
        } else if(this.x > (touchpoint.x + this.width/8)){ //Move to the Left
          this.setVelocityX(-300);
          this.fire = false;     //If we are moving, we consider we didn't want to fire
        } else{
          this.setVelocityX(0);
          //nothing to do
        }
      }
    }

    checkFire(time){
        //Better define a Fire Variable
      
        if (time > lastFired){
          if(this.fire && !levelReady){
            this.fire = false;
            var bullet = bullets.get(); //https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Group.html#get__anchor
            if (bullet){
                swingHighFX.play();
                bullet.fire(this);
                lastFired = time + delayFire;
            }
          }
        }
    }

    decreaseAndCheckLife(){
      this.lifeLeft -= 1;
      if(this.lifeLeft == 0){    //To force Only 1 Time GameOver
        return true;
      } else if(this.lifeLeft<0){
        this.lifeLeft = 0;
      }
      return false;
    }

    gameOver(){
        this.setVelocityX(0);
        this.anims.play('death', false);
    }
    iniLevel(){
        //maybe the position?
        this.lifeLeft = lifeIni;
        this.anims.play('standUp', true);
    }
    setAnimations(){
      //COMMON ANIMATIONS
      let keys = ['idle', 'gesture', 'walk', 'attack', 'death'];
      let repeats = [-1, -1, -1, 0, 0];
        
      for(let i = 0; i < keys.length; i++){
          this.scene.anims.create({
            key: keys[i],
            frames: this.scene.anims.generateFrameNumbers('rat', { start: 0+(i*10), end: 9+(i*10) }),
            frameRate: 10,
            repeat: repeats[i]
          });
      }

      //Transition Animations
      keys = ['standUp', 'idleUp', 'sitDown'];
      let frames = [{start: 12, end: 13},{start: 14, end: 17},{start: 18, end: 19}]
      repeats = [0,-1,0];
        
      for(let i = 0; i < keys.length; i++){
          this.scene.anims.create({
            key: keys[i],
            frames: this.scene.anims.generateFrameNumbers('rat', { start: frames[i].start, end: frames[i].end }),
            frameRate: 5,
            repeat: repeats[i]
          });
      }
    }
    updateAnimation(){
        //https://labs.phaser.io/index.html?dir=animation/&q=
      
        //play(key [, ignoreIfPlaying] [, startFrame])
        if(this.lifeLeft <= 0){
          //We should add also play('death')
          return;
        }
      
        if(this.body.velocity.x == 0 && this.body.velocity.y == 0){ //added .y when we jump
          //If don't walk
          switch(this.state) {
            case 'walk':
              this.anims.play('standUp', false);
              break;
            case 'standUp':
              this.anims.play('idleUp', true);
              break;
            default:
              this.anims.play('idleUp', true);
          } 
        } 
        else {
          //If walk
          switch(this.state) {
            case 'idleUp':
              this.anims.play('sitDown', false);
              break;
            case 'sitDown':
              this.anims.play('walk', true);
              break;
            default:
              this.anims.play('walk', true);
          } 
        }
      
        //Flip Frame if necessary
        if(this.body.velocity.x > 0){
          this.flipX = true;
        } else if(this.body.velocity.x < 0) {  //We use it, in order to don't turn when 0
          this.flipX = false;
        }
    }
}