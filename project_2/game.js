var gameport = document.getElementById("gameport");
var renderer = PIXI.autoDetectRenderer(400, 400, {backgroundColor : 0xeeeeee});
gameport.appendChild(renderer.view);

var state_stack = new stackhelper();

//var END = new PIXI.Text("Time's Up!", {font : '34px Arial', fill : 'black', align : 'center', wordWrap : true, wordWrapWidth : 200});



// some useful variables
var FPS = 45;

function animate()
{
	requestAnimationFrame(animate);
	var stage = states[state_stack.get_top()];
	renderer.render(stage);
}

// the game logic
function game_tick()
{
	
}

// game mechanics

window.onkeydown = function(e)
{
	var keyCode = e.keyCode;
	if(keyCode == 37) left_down = true; 
	if(keyCode == 39) right_down = true;
	
	if(timer <= 0 && restart_timer <= 0)
		start();
};
window.onkeyup = function(e)
{
	var keyCode = e.keyCode;
	if(keyCode == 37) left_down = false; 
	if(keyCode == 39) right_down = false; 
}

function start()
{
	game_tick();
}

function game_end()
{
}
function display_restart()
{
}

state_stack.push('top');

animate();