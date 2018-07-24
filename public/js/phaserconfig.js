var screenSize = setScreenSize();
const WIDTH = screenSize.w;  //this.cameras.main.width;
const HEIGHT = screenSize.h; //this.cameras.main.width;

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    pixelArt: true, //scale is NOT interpolated
    width: WIDTH,
    height: HEIGHT,
    //backgroundColor: '#006060',
    input: {
      gamepad: true //Important to use the Gamepad!!
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: DEBUG,
        gravity: { y: GRAVITY }
      }
    },
    scene: [LoadScene, MenuScene, GameScene] //The order is Important to define the Z-Index!
  };
   
var game = new Phaser.Game(config);

//FUNCTIONS
function setScreenSize(minWidth = 500, minHeight = 600, maxWidth = 1000, maxHeight = 1000){  
    //Get the width/height of screen
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    if(h<minHeight)  //the minHeight should be 600 in order to be playable
        h = minHeight;
    else if(h>maxHeight)
        h = maxHeight;
    
    if(w<minWidth)
        w = minWidth;
    else if(w>maxWidth)
        w = maxWidth;

    screenSize = { w: w-20, h: h-20}; //We force a Pan of 20 pixels

    console.log(screenSize);
    return screenSize;
}