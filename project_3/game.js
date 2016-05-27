var gameport = document.getElementById("gameport");
var renderer = PIXI.autoDetectRenderer(400, 400, {backgroundColor : 0xA52A2A});
gameport.appendChild(renderer.view);

var state_stack = new stackhelper();

var game_scale = 6;
var game_width = 400;
var game_height = 400;

var tu = new TileUtilities(PIXI);
var world;
var player;
var camera = {x: 0, y: 0};
var mapArray;

var keyCodes = {};
keyCodes[' '] = 32;
for(var i = 65; i <= 90; i++)
	keyCodes[String.fromCharCode(i + 32)] = i;

// some useful variables
var FPS = 45;

var gravity = 1/FPS;

var bg_playing = true;

window.onkeydown = function(e)
{
	var keyCode = e.keyCode;
	
	if(keyCode == keyCodes.m)
	{
		if(bg_playing)
			bg_music.stop();
		if(!bg_playing)
			bg_music.play();
		bg_playing = !bg_playing;
	}
	
	if(keyCode == keyCodes.w)
	{
		player.direction = 'up';
	}
	if(keyCode == keyCodes.d)
	{
		player.direction = 'right';
		player.hop.scale.x = 1;
		player.idle.scale.x = 1;
	}
	if(keyCode == keyCodes.s)
	{
		player.direction = 'down';
	}
	if(keyCode == keyCodes.a)
	{
		player.direction = 'left';
		player.hop.scale.x = -1;
		player.idle.scale.x = -1;
	}
	
	
	
	
};
window.onkeyup = function(e)
{
	var keyCode = e.keyCode;
	if(keyCode == keyCodes.w || keyCode == keyCodes.d || keyCode == keyCodes.s || keyCode == keyCodes.a)
	{
		player.direction = "none";
		player.do_idle();
	}
}

function animate()
{
	requestAnimationFrame(animate);
	var stage = states[state_stack.get_top()];
	renderer.render(stage);
	
}

// the game logic

var trigger1 = false;
var trigger2 = false;
var win = false;

function game_tick()
{
	
	if(player.direction != 'none')
	{
		var x0 = player.x;
		var y0 = player.y;
		
		var step = 1;
		
		if(player.direction == 'up')
			player.y = y0 - step*5/4;
		if(hittest_block(player)) player.y = y0;
		
		if(player.direction == 'down')
			player.y = y0 + step*5/4;
		if(hittest_block(player)) player.y = y0;
		
		if(player.direction == 'left')
			player.x = x0 - step*5/4;
		if(hittest_block(player)) player.x = x0;
		
		if(player.direction == 'right')
			player.x = x0 + step*5/4;
		if(hittest_block(player)) player.x = x0;
		
		if(x0 != player.x || y0 != player.y)
			player.do_hop();
	}
	
	if(player.x > 350 && player.x < 380 && player.y < 330)
	{
		player.y = 474;
		
		if(trigger1 == false)
		{
			// play sound
			trigger1 = true;
			PIXI.audioManager.getAudio('ding.mp3').play();
		}
	}
	if(player.x > 350 && player.x < 380 && player.y > 480)
	{
		player.y = 340;
	}
	if(player.x > 410 && player.x < 450 && player.y < 330)
	{
		player.y = 474;
		if(trigger1 && trigger2)
		{
			player.x += 96;
			player.y = 356;
		}
	}
	if(player.x > 410 && player.x < 450 && player.y > 480)
	{
		player.y = 340;
		if(trigger2 == false)
		{
			// play sound
			trigger2 = true;
			PIXI.audioManager.getAudio('ding.mp3').play();
		}
	}
	
	if(player.y < 162)
	{
		// winner!
		if(win == false)
		{
			win = true;
			PIXI.audioManager.getAudio('finish.mp3').play();
			setTimeout(function()
				{
					state_stack.push('done');
				}, 1000);
		}
	}
	
	get_camera_pos(player, camera);
	states.top.x = camera.x;
	states.top.y = camera.y;
	
	setTimeout(game_tick, 1000 / FPS);
}

// game mechanics

function hittest_block(who)
{
	//who.y += 42;
	var result = tu.hitTestTile(who, mapArray, 0, world, 'every');
	//who.y -= 42;
	
	return result.hit == false;
}

// the entry point to the game
function start()
{
	if(world != undefined)
	{
		states.top.removeChild(world);
		trigger1 = false;
		trigger2 = false;
		win = false;
	}
	
	world = tu.makeTiledWorld("map_json", "tileset.png");
	states.top.addChild(world);
	
	states.top.scale.x = game_scale;
	states.top.scale.y = game_scale;
	
	mapArray = world.getObject("world").data;
	//world.getObject('world').y = -42;
	
	construct_player();
	
	game_tick();
}

function get_camera_pos(focus, camera) {
  var x = -focus.x*game_scale + game_width/2;
  var y = -focus.y*game_scale + game_height/2;
  x = -Math.max(0, Math.min(world.worldWidth*game_scale - game_width, -x));
  y = -Math.max(0, Math.min(world.worldHeight*game_scale - game_height, -y));
  camera.x = x;
  camera.y = y;
}



function construct_player()
{
	var spawn = world.getObject('derpy');
	player = new PIXI.Container();
	
	var idle = new PIXI.extras.MovieClip([PIXI.Texture.fromFrame('frog1'), PIXI.Texture.fromFrame('frog2')]);
	idle.animationSpeed = 0.1;
	idle.play();
	player.addChild(idle);
	player.idle = idle;
	
	idle.anchor.x = 0.5;
	idle.x = 8;
	
	var hop = new PIXI.Sprite(_tex.frog_hop);
	player.addChild(hop);
	player.hop = hop;
	hop.visible = false;
	
	hop.anchor.x = 0.5;
	hop.x = 8;
	
	player.x = spawn.x;
	player.y = spawn.y;
	
	player.scale.x = 0.5;
	player.scale.y = 0.5;
	
	world.getObject('objects').addChild(player);
	
	player.direction = 'none';
	
	player.do_hop = function()
	{
		player.idle.visible = false;
		player.hop.visible = true;
	};
	player.do_idle = function()
	{
		player.idle.visible = true;
		player.hop.visible = false;
	};
	
}






