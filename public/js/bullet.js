var Bullet = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Image,
  
    initialize:
  
    function Bullet (scene)
    {
        //console.log('New Bullet!')
        Phaser.Physics.Arcade.Image.call(this, scene, 0, 0, 'bullet');
  
        //this.setBlendMode(1); //Para que ilumine el fondo!
        this.setDepth(3);
  
        this.speed = bulletSpeed;       //Speed of the bullet!
  
        //this._temp = new Phaser.Math.Vector2();
    },
  
    fire: function (weapon)
    {
      this.lifespan = bulletLifespan;   //Reset Lifespan in fire
  
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