
var game_scale = 2;
var game_width = 800;
var game_height = 600;

var gameport = document.getElementById("gameport");
var renderer = PIXI.autoDetectRenderer(game_width, game_height, {backgroundColor : 0x44bbbb});
gameport.appendChild(renderer.view);

var state_stack = new stackhelper();

var pi = 3.1415926535897932384626433832795028841971;
var pi2 = pi/2;


var tu = new TileUtilities(PIXI);
var su = new SpriteUtilities(PIXI);
var world;
var player = null;
var viewport = new PIXI.Container();
var mapArray;

// some useful variables
var FPS = 45;

var gravity = 1/FPS;

var bg_playing = true;

window.onkeydown = function(e)
{
	var key = keycode_to_str(e.keyCode);
	
	if(key == 'M')
	{
		if(bg_playing)
			bg_music.stop();
		if(!bg_playing)
			bg_music.play();
		bg_playing = !bg_playing;
	}
	
	if(player != undefined)
		player.handle_button_down(key);
};
window.onkeyup = function(e)
{
	var key = keycode_to_str(e.keyCode);
	
	if(player != undefined)
		player.handle_button_up(key);
}

function animate()
{
	requestAnimationFrame(animate);
	var stage = states[state_stack.get_top()];
	renderer.render(stage);
	
}

// the game logic

var current_level = 0;
var game_state = 'none';
var MAX_SPEED = 5;

var points = 0;

function game_tick()
{
	if(game_state == 'none') return;
	if(game_state == 'win')
	{
		player.speed = MAX_SPEED / 2;
		player.angle = pi2;
		player.move();
		
		// test to see when we should load up the next map
		if(player.x > world.worldWidth + game_width / 2)
		{
			if(current_level < num_levels)
			{
				setTimeout(function()
					{
						load_level(current_level + 1);
						move_player_to_position_for_next_level();
					}, 1000);
				
				game_state = 'pre_level';
			}
		}
		
		viewport.x = -player.x*game_scale + game_width /2;
		
		setTimeout(game_tick, 1000 / FPS);
	}
	else if(game_state == 'pre_level')
	{
		
	}
	else if(game_state == 'play')
	{
		player.apply_gravity();
		player.move();
		
		get_camera_pos(player, viewport);
		
		elements.gamebg.g.x = -Math.max(0, 
			Math.min((elements.gamebg.g.width - game_width), 
				(elements.gamebg.g.width - game_width) * (player.x / world.worldWidth)));
		
		elements.points.g.text = points;
		
		if(player.y < 0 || 
			//player.x > world.worldWidth || 
			//player.x < 0 || 
			player.y > world.worldHeight ||
			hittest_block(player, levels[current_level].solid_blocks) == true)
			{
				// crash
				game_state = 'crash';
				
				setTimeout(function(){restart_level();}, 1000);
			}
		
		if(hittest_block(player, levels[current_level].end_blocks) == true)
		{
			finish_level();
		}
		setTimeout(game_tick, 1000 / FPS);
	}
	else if(game_state == 'crash')
	{
		
	}
	//elements.gamebg.g.x = player.x - game_width / game_scale;
	//elements.gamebg.g.y = player.y - game_height / game_scale;
	
}

// game mechanics

function hittest_block(who, blocks)
{
	if(who.x < 0) return false;
	
	var index = tu.getIndex(who.x, who.y, world.tilewidth, world.tileheight, world.widthInTiles);
	var tile = tu.getTile(index, mapArray, world).gid;
	
	for(var i = 0; i < blocks.length; i++)
		if(tile == blocks[i])
			return true;
	return false;
}
function get_block_gid_at(who)
{
	return tu.hitTestTile(who, mapArray, 0, world, 'some').gid;
}

// the entry point to the game
function start()
{
	elements.game_viewport_container.g.addChild(viewport);
	
	elements.game_ui_container.g.visible = false;
	
	viewport.scale.x = game_scale;
	viewport.scale.y = game_scale;
	
	load_level(1);
	start_level();
}

function start_level()
{
	if(game_state != 'play') 
	{
		game_state = 'play';
		game_tick();
	}
}
function restart_level()
{
	load_level(current_level);
	start_level();
}

function load_level(n)
{
	// reset the world
	if(world != undefined)
	{
		viewport.removeChild(world);
		viewport.removeChild(player);
		win = false;
	}
	
	world = tu.makeTiledWorld(levels[n].map, levels[n].tileset);
	viewport.addChild(world);
	
	mapArray = world.getObject('map').data;
	
	construct_player();
	
	player.speed = 2;
	player.angle = pi2;
	
	current_level = n;
}

function finish_level()
{
	// show 'you win' overlay
	// autopilot plane at horizontal moderate speed
	// load next level
	
	game_state = 'win';
	
	createjs.Tween.get(viewport).to({y: -player.y*game_scale + (game_height /2)}
			, 1500).call(function()
			{
				
			});
	
	elements.game_ui_container.g.visible = true;
	elements.game_ui_container.g.alpha = 0;
	createjs.Tween.get(elements.game_ui_container.g).to({alpha: 1}, 1000);
	
	elements.level_complete.g.text = "Area " + current_level + " Complete!"
	elements.level_complete.g.alpha = 1;
	elements.level_next.g.alpha = 0;
	
}
function move_player_to_position_for_next_level()
{
	player.x = -game_width /4;
	viewport.x = -player.x * game_scale + game_width /2;
	var spawn = world.getObject('spawn');
	
	var camera = {};
	get_camera_pos(spawn, camera);
	
	createjs.Tween.get(viewport).to({y: camera.y}, 2500).call(function()
		{
			start_level();
		});
	createjs.Tween.get(player).to({y: spawn.y}, 2000, createjs.Ease.cubicInOut);
	
	elements.level_next.g.text = "Area " + current_level;
	createjs.Tween.get(elements.level_complete.g).to({alpha: 0}, 2000);
	createjs.Tween.get(elements.level_next.g).to({alpha: 1}, 2000).call(function()
		{
			createjs.Tween.get(elements.game_ui_container.g).to({alpha: 0}, 2000)
				.call(function()
					{
						elements.game_ui_container.g.visible = false;
					});
		});
	createjs.Tween.get(elements.gamebg.g).to({x: 0}, 2000);
}

function get_camera_pos(focus, camera) {
	var x = -focus.x*game_scale + game_width/2;
	var y = -focus.y*game_scale + game_height/2;
	//x = -Math.max(0, Math.min(world.worldWidth*game_scale - game_width, -x));
	y = -Math.max(0, Math.min(world.worldHeight*game_scale - game_height, -y));
	camera.x = x;
	camera.y = y;
}



function construct_player()
{
	var playerscale = 1;
	
	var spawn = world.getObject('spawn');
	
	var tx = new PIXI.BaseTexture.fromImage('dat/airplane.png');
	var frames = [
		new PIXI.Texture(tx, new PIXI.Rectangle(0, 0, 40, 40)),
		new PIXI.Texture(tx, new PIXI.Rectangle(40, 0, 40, 40)),
		new PIXI.Texture(tx, new PIXI.Rectangle(80, 0, 40, 40))
	];
	
	player = new PIXI.Container();
	viewport.addChild(player);
	
	var g = new PIXI.extras.MovieClip(frames);
	player.addChild(g);
	player.g = g;
	
	g.scale.x = playerscale;
	g.scale.y = playerscale;
	
	g.anchor.x = 0.5;
	g.anchor.y = 0.5;
	
	player.x = spawn.x - game_width /4;
	player.y = spawn.y;
	
	player.g.play();
	player.g.animationSpeed = 0.1;
	
	player.speed = 0;
	player.stalling_speed = 0;
	
	player.facing = 1; // 1 for normal, -1 for upside down; when travelling to the right
	
	player.angle = 0; // angle from vertical
	
	var flags = {
		flipped: false
	};
	
	player.state = 'normal';
	
	player.apply_gravity = function()
	{
		var MAX_BOOST = MAX_SPEED * 2;
		
		if(player.angle > 0)
			player.angle = Math.min(pi, player.angle + gravity);
		else
			player.angle = Math.max(-pi, player.angle - gravity);
		
		if(player.state == 'normal')
		{
			if(player.angle > -pi2 && player.angle < pi2)
			{
				player.speed -= (pi2 - Math.abs(player.angle)) * gravity;
				
				if(player.speed < 0)
				{
					player.speed = 0;
					player.stalling_speed = Math.min(player.stalling_speed + gravity, MAX_SPEED);
				}
				else
				{
					player.stalling_speed = 0;
				}
			}
			else
			{
				
				player.speed += Math.abs(pi2 - Math.abs(player.angle)) * gravity * 1.5;
				player.speed = Math.min(MAX_SPEED, player.speed);
			}
		}
		else if(player.state == 'boost')
		{
			player.speed = MAX_BOOST;
		}
		
	};
	
	player.move = function()
	{
		var handling_const = 0.08;
		
		if(game_state == 'play')
		{
			if(flags.W)
			{
				player.angle += -player.facing * handling_const;
			}
			
			if((flags.A || flags.D) && flags.flipped == false)
			{
				flags.flipped = true;
				player.flip();
			}
		}
		
		if(player.angle < -pi) player.angle += 2*pi;
		if(player.angle > pi) player.angle -= 2*pi;
		
		var effective_angle = player.angle - pi2;
		
		player.g.rotation = effective_angle;
		
		var dx = Math.cos(effective_angle) * player.speed;
		var dy = Math.sin(effective_angle) * player.speed;
		
		player.x += dx;
		player.y += dy + player.stalling_speed;
	};
	
	player.handle_button_down = function(button)
	{
		flags[button] = true;
	};
	
	player.handle_button_up = function(button)
	{
		flags[button] = false;
		flags.flipped = false;
	};
	
	player.flip = function()
	{
		player.facing = -player.facing;
		createjs.Tween.get(player.g.scale).to({y: player.facing * playerscale}, 150);
	};
	
	player.apply_boost = function()
	{
		player.state = 'boost';
		setTimeout(function()
			{
				player.state = 'normal';
			}, 5 * 1000);
	};
	
}






