class MenuScene extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'MenuScene', active: false });
    }
  
    preload() {
  
    }
  
    create ()
    {
        //Create some kind of Main Menu before to Play
        //We can add some kind of "Press Start"
        //SET SOUNDS and ANIMATIONS?

        var menuText = this.add.bitmapText(WIDTH/2, HEIGHT/2, 'gem', 'Press Fire');
        menuText.setOrigin(0.5).setScale(2);    //SetScale at the End!

        //intermitent object
        intermittentObject.call(this, menuText)
        
        //SELECT Here the Input depending on Fire
        //START Listeners
        this.input.on('pointerdown', function (pointer) {
            console.log('Input Mouse')
            this.scene.start('GameScene');
        }, this);

        this.input.keyboard.on('keydown', function (event) {
            console.log('Input Keyboard')
            this.scene.start('GameScene');
        }, this);
    }

    update ()
    {

    }
}

//https://stackoverflow.com/questions/29514382/global-functions-in-javascript

function intermittentObject(object, hold = 500, duration = hold-100){
    object.setAlpha(0);
    this.tweens.add({
        targets: object,
        alpha: 1,
        duration: duration,
        //ease: 'Power2',
        yoyo: true,
        hold: hold,
        repeat: -1,
    });
}

/*
  SET INPUTS
  ===================
*/

