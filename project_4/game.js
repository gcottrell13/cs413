
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

var now;
var elapsed = Date.now();

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
	
	now = Date.now();
	
	if(emitter != null)
		emitter.update((now - elapsed) * 0.001);
	elapsed = now;
	
	requestAnimationFrame(animate);
	var stage = states[state_stack.get_top()];
	renderer.render(stage);
	
}

// the game logic

var current_level = 0;
var game_state = 'none';
var MAX_SPEED = 5;
var START_SPEED = 2;

var points = 0;
var level_score = 0;
var multiplier = 1;
var powerup_chain = 0;
var max_powerup_chain = 5;
var powerup_objects = [];

function game_tick()
{
	if(game_state == 'none') return;
	if(game_state == 'win')
	{
		player.speed = MAX_SPEED / 2;
		player.angle = pi2;
		player.move();
		
		// test to see when we should load up the next map
		if(current_level < num_levels)
		{
			if(player.x > world.worldWidth + game_width / 2)
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
		
		if(player.y < 0 || 
			//player.x > world.worldWidth || 
			//player.x < 0 || 
			player.y > world.worldHeight ||
			hittest_block(player, levels[current_level].solid_blocks) == true)
			{
				// crash
				game_state = 'crash';
				
				crash();
			}
		
		if(hittest_block(player, levels[current_level].end_blocks) == true)
		{
			finish_level();
		}
		
		for(var i = 0; i < powerup_objects.length; i++)
		{
			var p = powerup_objects[i];
			if(Math.pow(player.x - p.x, 2) + Math.pow(player.y - p.y, 2) <= p.radius*p.radius)
			{
				if(collect_powerup(p))
				{
					p.visible = false;
					p.collected = true;
				}
			}
		}
		
		setTimeout(game_tick, 1000 / FPS);
	}
	else if(game_state == 'crash')
	{
	}
	//elements.gamebg.g.x = player.x - game_width / game_scale;
	//elements.gamebg.g.y = player.y - game_height / game_scale;
	
}


// the entry point to the game
function start()
{
	elements.game_viewport_container.g.addChild(viewport);
	
	elements.game_ui_container.g.visible = false;
	
	// setting up the multiplier visualization
	var tx = new PIXI.BaseTexture.fromImage('dat/point.png');
	var frame = new PIXI.Texture(tx, new PIXI.Rectangle(2, 2, 16, 16));
	for(var i = 0; i < max_powerup_chain; i++)
	{
		var s = new PIXI.Sprite(frame);
		s.x = 10 + 25 * i;
		s.y = 70;
		s.scale.x = 2;
		s.scale.y = 2;
		elements.game_points_container.g.addChild(s);
		elements.game_points_container.g['marker' + i] = s;
		s.visible = false;
	}
	
	viewport.scale.x = game_scale;
	viewport.scale.y = game_scale;
	
	load_level(1);
	start_level();
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

function collect_powerup(p)
{
	if(p.collected == true) return false;
	
	var type = p.powerup_type;
	if(type == 'point')
	{
		add_point();
	}
	else
	{
		return false;
	}
	
	return true;
}
function add_point()
{
	level_score += multiplier;
	
	powerup_chain ++;
	if(powerup_chain >= 5)
	{
		multiplier ++;
		powerup_chain = 0;
	}
	
	display_points();
}

function display_points()
{
	elements.points.g.text = level_score + points;

	elements.points_extra.g.text = "Multiply: " + multiplier;
	
	for(var i = 0; i < max_powerup_chain; i++)
	{
		var s = elements.game_points_container.g['marker' + i];
		s.visible = (i < powerup_chain);
	}
}


function crash()
{
	spray_explosion();
	player.visible = false;
	
	elements.points_bg.g.tint = 0xcc4444;
	level_score = 0;
	multiplier = Math.max(1, multiplier - 3);
	powerup_chain = 0;
	display_points();
	
	setTimeout(function(){elements.points_bg.g.tint = 0xffffff; restart_level();}, 2000);
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
	//load_level(current_level);
	
	for(var i = 0; i < powerup_objects.length; i++)
	{
		var p = powerup_objects[i];
		
		if(p.powerup_type == 'point')
		{
			p.collected = false;
			p.visible = true;
		}
	}
	
	var spawn = world.getObject('spawn');
	player.x = -game_width /4;
	player.y = spawn.y;
	player.angle = pi2;
	player.speed = START_SPEED;
	player.visible = true;
	
	if(player.facing == -1) player.flip();
	
	start_level();
}

function load_level(n)
{
	// reset the world
	if(world != undefined)
	{
		viewport.removeChild(world);
		viewport.removeChild(player);
		
		for(var i = 0; i < powerup_objects.length; i++)
			viewport.removeChild(powerup_objects[i]);
		powerup_objects = [];
		
		win = false;
	}
	
	world = tu.makeTiledWorld(levels[n].map, levels[n].tileset);
	viewport.addChild(world);
	
	mapArray = world.getObject('map').data;
	
	display_points();
	
	construct_player();
	construct_powerups();
	
	player.speed = START_SPEED;
	player.angle = pi2;
	
	current_level = n;
}

function finish_level()
{
	// show 'you win' overlay
	// autopilot plane at horizontal moderate speed
	// load next level
	
	game_state = 'win';
	
	points += level_score;
	level_score = 0;
	
	display_points();
	
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
	
	if(current_level >= num_levels)
	{
		elements.level_complete.g.text += '\nAll Areas Complete!\nWell Done!';
		elements.level_next.g.alpha = 1;
		
		// show previous high score
		var hs = parseInt(getCookie('airraid_highscore'));
		if(points > hs)
		{
			elements.level_next.g.text = "New High Score!\n" + points;
			setCookie('airraid_highscore', points, 100);
		}
		else
		{
			elements.level_next.g.text = "Your current score: " + points + "\nYour High Score: " + hs;
		}
	}
	
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

function construct_powerups()
{
	var p = world.getObjects('point');
	
	var tx = new PIXI.BaseTexture.fromImage('dat/point.png');
	var frames = [
		new PIXI.Texture(tx, new PIXI.Rectangle(2, 2, 16, 16)),
		new PIXI.Texture(tx, new PIXI.Rectangle(20, 2, 16, 16)),
		new PIXI.Texture(tx, new PIXI.Rectangle(38, 2, 16, 16))
	];
	
	for(var i = 0; i < p.length; i++)
	{
		var point = new PIXI.Container();
		var g = new PIXI.extras.MovieClip(frames);
		
		point.g = g;
		
		viewport.addChild(point);
		point.addChild(g);
		
		point.g.anchor.x = 0.5;
		point.g.anchor.y = 0.5;
		
		point.x = p[i].x + 8;
		point.y = p[i].y - 8;
		
		g.animationSpeed = 0.3;
		g.play();
		
		powerup_objects.push(point);
		
		point.radius = 16;
		point.powerup_type = 'point';
		point.collected = false;
	}
	
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
			
			if(flags.D && flags.flipped == false)
			{
				flags.flipped = true;
				player.flip();
			}
			if(flags.A)
			{
				player.speed *= 1 - 1/FPS;
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


var emitter = null;

function spray_explosion()
{
	
	if(emitter != null)
	{
		emitter.destroy();
	}
	
	var x = player.x;
	var y = player.y;
	var speed = player.speed;
	var angle = player.g.rotation * 180 / pi;
	
	var speed_mult = 12;
	var speed_variance = 2;
	var angle_variance = 35;
	
	explosion_emitter.speed.start = Math.max(1, (speed - speed_variance) * speed_mult, 0);
	explosion_emitter.speed.end = explosion_emitter.speed.start + speed_variance * 2 * speed_mult;
	explosion_emitter.startRotation.min = angle - angle_variance;
	explosion_emitter.startRotation.max = angle + angle_variance;
	
	emitter = new PIXI.particles.Emitter(viewport, 
		[PIXI.Texture.fromImage('dat/Pixel25px.png')],
		explosion_emitter);
	
	emitter.updateSpawnPos(x, y);
	emitter.emit = true;
}




