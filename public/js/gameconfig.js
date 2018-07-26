//For debugging  
const DEBUG = false;
var debugText;  

//Game
const soupTint = 0xdfff80;  //https://www.w3schools.com/colors/colors_picker.asp
const ratGravity = 900;
const GRAVITY = 200;
const lifeIni = 5;


//Ingredients
const framesNumber = 37;    //Number of Available Ingredient Frames
const delayItems = 500;
const itemBounce = 0.3;
const itemSpeedMin = 100;
const itemSpeedMax = 400;
const itemRotationMax = 50; //left and right 
const itemHitRotationMax = 500; //left and right 
const itemWaterRotationMax = 100; //left and right 

//Bullets
const delayFire = 200;  //Delay between fired bullets
const bulletLifespan = 1000;
const bulletSpeed = 700;

//Ini Game Values
var lifeLeft = lifeIni;
var gameLevel = 1;  //we set the numberScreenItems and numberReceptItems depending on it.
var numberReceptItems = 2; //Recept, depending on the Level
var sameItemsReceptMax = 2; //Max Number Items per Ingredient in Recept
var numberScreenItems = 2*numberReceptItems; //Simultaneous, depending on the Level
var levelReady = true;
var lastFired = 0;

//Global Variables
var background;
var rat;
var pot;
var potSides;
var water;
var ingredients;  //ingredients in Screen
var receptItems;  //The recept of the Level
var bullets;

//Input
var gamepad;
var touchpoint = null; //vector where we have touch (for smartphone)

//Helpers
var spaceLaunch;  //From where the Ingredients are Launched
var spaceInGame;  //InGame Zone
var spaceInPot;   //Zone to detect a Ingredient inside the Pot.
var ingredientsFrames = [];   //Available frames to choose per level
var receptItemsArray = [];  //Helper for ReceptItems Container

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

//Texts
var rightTopText = {lifeText:null, lifeNumber:null};
var centerText = {iniLevel:null, gameLevel:null, winLevel: null, lostLevel: null};  //Diferentes textos en esa posición
  
