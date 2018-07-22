
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
  
      this.setAngularVelocity(Phaser.Math.Between((-1)*itemRotationMax, itemRotationMax));
      this.setBounce(itemBounce);  //Si queremos fijar valores al body
  
      var angle = Phaser.Math.Angle.BetweenPoints(pStart, pEnd);
      this.scene.physics.velocityFromRotation(angle, Phaser.Math.Between(itemSpeedMin, itemSpeedMax), this.body.velocity);
  
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
        addIngredient(ingredientsFrames[Phaser.Math.Between(0, ingredientsFrames.length)]); //creamos uno nuevo, con los frames disponibles
      }
    },
  
    kill: function () //function created, but IT's NOT detected as Dead!!
    {
        this.setActive(false);		//Kill it
        this.setVisible(false);
        this.body.stop();		//Stop the movement of the body, but can collide! Then body.reset(x, y) to start again
    }
  
});