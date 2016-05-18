var gameport = document.getElementById("gameport");
var renderer = PIXI.autoDetectRenderer(400, 400, {backgroundColor : 0xeeeeee});
gameport.appendChild(renderer.view);
var stage = new PIXI.Container();

var start_text = new PIXI.Text("Press anything to start the game!", {font : '24px Arial', fill : 'black', align : 'center', wordWrap : true, wordWrapWidth : 200});
var restart_text = new PIXI.Text("Game over! Press anything to restart the game!", {font : '24px Arial', fill : 'black', align : 'center', wordWrap : true, wordWrapWidth : 200});
var END = new PIXI.Text("END!", {font : '34px Arial', fill : 'black', align : 'center', wordWrap : true, wordWrapWidth : 200});


function load_texture_path(path, name)
{
	var t = PIXI.Texture.fromImage(path);
	_tex[name] = t;
}
function new_sprite(tx_name)
{
	var s = new PIXI.Sprite(_tex[tx_name]);
	return s;
}

var _tex = {};
var apples = [];
var num_apples = 0;

var score = 0;

var speed = 10;
var left_down = false;
var right_down = false;

var gravity = 0.03;

var max_time = 30;
var timer = 0;

var restart_timer = 0;

var plays = 0;

load_texture_path("apple_green_good.png", "green");
load_texture_path("apple_pink_good.png", "pink");
load_texture_path("apple_red_good.png", "red");
load_texture_path("bucket.png", "bucket");


function new_apple()
{
	var r = Math.random() * 3;
	var apple = {falling : true, r : Math.random() * 0.125 - 0.0625, dy : 0};
	
	if(r > 2)
		apple.g = new_sprite("green");
	else if(r > 1)
		apple.g = new_sprite('pink');
	else
		apple.g = new_sprite('red');
	
	apple.g.anchor.x = 0.5;
	apple.g.anchor.y = 0.5;
	
	stage.addChild(apple.g);
	return apple;
}
function remove_apple(a)
{
	stage.removeChild(a.g);
	a.g = 0;
}

function animate()
{
	requestAnimationFrame(animate);
	renderer.render(stage);
}
function game_tick()
{
	if(timer > 0)
		setTimeout(game_tick, 1000/45); // 45 fps
	else
		game_end();
	
	for(var i = 0; i < num_apples; i++)
	{
		var a = apples[i];
		
		if(a.g == 0)
		{
			// this is an invalid apple, it should be removed
			// swap the last apple into this place
			apples[i] = apples[num_apples - 1];
			apples[num_apples - 1] = 0;
			num_apples --;
		}
		else if(a.falling == true)
		{
			a.g.rotation += a.r;
			a.dy += gravity; // simulate gravity
			
			if(a.g.y < 400)
			{
				a.g.y += a.dy;
				check_collision_w_bucket(a); // check to see if the bucket caught an apple
			}
			else
				remove_apple(a);
		}
		
	}
	
	if(left_down) bucket.x = Math.max(bucket.x - speed, 4);
	if(right_down) bucket.x = Math.min(bucket.x + speed, 396);
	
}

function add_apple_regularly()
{
	var newapple = new_apple();
	
	newapple.g.x = Math.random() * 400;
	
	apples[num_apples] = newapple;
	num_apples ++;
	
	if(timer > 0)
		setTimeout(add_apple_regularly, 100);
}


var bucket = new_sprite('bucket');
bucket.anchor.x = 0.5;
bucket.anchor.y = 0.5;

bucket.y = 400 - 45/2;

stage.addChild(bucket);

// game mechanics

function check_collision_w_bucket(a)
{
	if(Math.abs(bucket.x - a.g.x) < 31 && a.g.y >= bucket.y)
	{
		// caught the apple
		score ++;
		remove_apple(a);
		
		document.getElementById("score_display").innerHTML = "Score: " + score;
	}
}

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


function decrement_timer()
{
	timer --;
	
	if(timer > 0)
	{
		setTimeout(decrement_timer, 1000);
	}
	
	document.getElementById("timer_display").innerHTML = "Seconds left: " + timer;
}

function start()
{
	timer = max_time;
	score = 0;
	document.getElementById("score_display").innerHTML = "Score: 0";
	
	apples = [];
	num_apples = 0;
	
	plays += 1;
	
	add_apple_regularly();
	game_tick();
	decrement_timer();
	
	if(plays > 1)
		stage.removeChild(restart_text);
	else
		stage.removeChild(start_text);
}

function game_end()
{
	stage.addChild(END);
	restart_timer = 2;
	setTimeout(display_restart, 2000);
}
function display_restart()
{
	stage.addChild(restart_text);
	stage.removeChild(END);
	restart_timer = 0;
	
	for(var i = 0; i < num_apples; i++)
	{
		remove_apple(apples[i]);
	}
}

stage.addChild(start_text);
start_text.x = 100;
start_text.y = 100;

restart_text.x = 100;
restart_text.y = 100;

END.x = 100;
END.y = 100;

animate();