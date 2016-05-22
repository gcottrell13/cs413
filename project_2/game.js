var gameport = document.getElementById("gameport");
var renderer = PIXI.autoDetectRenderer(400, 400, {backgroundColor : 0x666688});
gameport.appendChild(renderer.view);

var state_stack = new stackhelper();

var keyCodes = {};
keyCodes[' '] = 32;
for(var i = 65; i <= 90; i++)
	keyCodes[String.fromCharCode(i + 32)] = i;

// some useful variables
var FPS = 45;

var bg_playing = true;

var circles = [];

var gear_teeth_contact = 30;
var gear_center_contact = 20;

function animate()
{
	requestAnimationFrame(animate);
	var stage = states[state_stack.get_top()];
	renderer.render(stage);
	
	if(state_stack.get_top() == 'top')
	{
		elements.menu_gear.g.rotation += 0.03;
		elements.menu_gear2.g.rotation += -0.06;
	}
	
	for(var i = 0; i < circles.length; i++)
	{
		if(context != undefined)
		{
			context.beginPath();
			context.arc(circles[i][0], circles[i][1], circles[i][2], 0, 2 * Math.PI, false);
			context.fillStyle = circles[i][3];
			context.fill();
			context.lineWidth = 0;
			context.strokeStyle = circles[i][3];
			context.stroke();
			context.endPath();
			
		}
	}
	circles = [];
	
}

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
};
window.onkeyup = function(e)
{
	var keyCode = e.keyCode;
}

function draw_circle(x, y, r, color)
{
	circles.push([x, y, r, color]);
}

// the game logic

var start_button_fallen = false;
var start_button_fixed = false;

var current_level = 0;
var current_root = null;

var level_go = false;

var rotator_speed = 1 / FPS;

function game_tick()
{
	if(current_level > 0 && state_stack.get_top() == 'game' && level_go) // if we have a valid level ID
	{
		var root = levels[current_level].root;
		
		if(root == undefined) return;
		
		// zero out motion on the free gears
		for(var i = 0; i < root.free_gears.length; i++)
		{
			var g = root.free_gears[i];
			g.angular_velocity = 0;
			g.locked = false;
			g.tint = 0xffffff;
		}
			
		// rotate the starts
		for(var i = 0; i < root.rotators.length; i++)
		{
			var r = root.rotators[i];
			power_gear(root, r, rotator_speed * r.speed);
		}
		
		for(var i = 0; i < root.all_gears.length; i++)
			// then finally rotate
			//if(root.all_gears[i].locked == false) 
				root.all_gears[i].rotation += root.all_gears[i].angular_velocity;
		
		// check progress on the goals
		var all_complete = true;
		for(var i = 0; i < root.goals.length; i++)
		{
			var g = root.goals[i];
			var progress = g.rotation / g.goal;
			var progress_display = Math.min(100, Math.floor(progress * 100)) + '%';
			
			if(progress < 0)
				progress_display = 'Wrong\n way!';
			
			g.progress.text = progress_display;
			
			if(progress < 1) all_complete = false;
		}
		
		if(all_complete && levels[current_level].complete == undefined)
		{
			levels[current_level].complete = true;
			
			var finish_text = new PIXI.Text("Level Complete!\nGo back for the next one!", {font: "16px Arial", fill: "white"});
			finish_text.x = 5;
			finish_text.y = 90;
			root.addChild(finish_text);
			
			if(current_level < num_levels)
				make_level_available(current_level + 1);
		}
		
	}
	
	setTimeout(game_tick, 1000 / FPS);
}

// game mechanics

function make_level_available(n)
{
	levels[n].available = true;
	levels[n].button.visible = true;
	
	var highest = getCookie('gear_grinder');
	setCookie('gear_grinder', Math.max(highest, n), 100);
}

function reset_level(root)
{
	for(var i = 0; i < root.all_gears.length; i++)
	{
		var g = root.all_gears[i];
		
		g.rotation = 0;
		
		if(g.gear_type == 'drag')
		{
			g.x = g.baseX;
			g.y = g.baseY;
		}
	}
}

function stop_gears(root)
{
	for(var i = 0; i < root.all_gears.length; i++)
	{
		var g = root.all_gears[i];
		
		if(g.gear_type == 'goal')
			g.rotation = 0;
	}
	level_go = false;
}

function go_gears(root)
{
	level_go = true;
}


function power_gear(root, g, sv)
{
	g.angular_velocity = sv;
	
	var n_neighbors = 0;
	// check to see if it can power other nearby gears
	for(var j = 0; j < root.all_gears.length; j++)
	{
		var g2 = root.all_gears[j];
		if(g2 != g) // we don't want to power ourselves
		{
			var dist2 = (Math.pow(g2.x - g.x, 2) + Math.pow(g2.y - g.y, 2));
			var rad2 = Math.pow(42*g.size + 42*g2.size, 2);
			
			// if their distance is within 30 pixels of their added radii
			if(Math.abs(dist2 - rad2) <= gear_teeth_contact*gear_teeth_contact)
			{
				n_neighbors ++;
				if(g2.powered == false)
				{
					if(g2.locked) g.locked = true;
					if(g2.angular_velocity == 0) power_gear(root, g2, -g.angular_velocity * (g.size / g2.size));
					if(g2.angular_velocity != -g.angular_velocity * (g.size / g2.size)) g2.locked = g.locked = true;
				}
			}
			else if(dist2 < gear_center_contact*gear_center_contact) // if their centers are within 20 pixels, then bind their angular velocities
			{
				n_neighbors ++;
				if(g.powered == false && g2.powered == false)
				{
					if(g2.locked) g.locked = true;
					if(g2.angular_velocity == 0) power_gear(root, g2, g.angular_velocity);
					if(g2.angular_velocity != g.angular_velocity) g2.locked = g.locked = true;
				}
				
				g.tint = 0xff99ff;
				g2.tint = 0xff99ff;
			}
		}
	}
	if(n_neighbors == 0)
		g.locked = false;
}

// the entry point to the game
function start()
{
	game_tick();
	
	state_stack.push('level_choose');
	
	var x = 50;
	var y = 100;
	for(var i = 1; i <= num_levels; i++)
	{
		if(levels[i].available == undefined)
			levels[i].available = false;
		
		var level_button = new PIXI.Sprite();
		level_button.interactive = true;
		level_button.buttonMode = true;
		
		level_button.visible = false;
		
		level_button.id = i;
		level_button.click = (function(d){
			return function(md)
				{
					current_level = d;
					state_stack.push('game');
					
					level_go = false;
					construct_level(d);
				};})(i);
		
		level_button.x = x;
		level_button.y = y;
		
		var level_back = new_sprite('progress_back');
		level_back.width = 100;
		level_back.height = 50;
		
		var level_text = new PIXI.Text(levels[i].name, {font: '16px Arial', fill: 'white', align: 'center', wordWrap: true, wordWrapWidth: 100});
		level_text.x = 10;
		level_text.y = 17;
		
		level_button.addChild(level_back);
		level_button.addChild(level_text);
		states.level_choose.addChild(level_button);
		
		levels[i].button = level_button;
		
		x += 105;
		if(x >= 350)
		{
			y += 105;
			x = 50;
		}
	}
	
	if(getCookie('gear_grinder') == "")
		setCookie('gear_grinder', 1, 100);
	
	var highest = parseInt(getCookie('gear_grinder'));
	for(var i = 1; i <= highest; i++)
		make_level_available(i);
	
}

function construct_level(levelid)
{
	var info = levels[levelid];
	
	var root = info.root || new PIXI.Container(0, true);
	
	if(current_root != null)
		states[state_stack.get_top()].removeChild(current_root);
	
	current_root = root;
	states[state_stack.get_top()].addChild(root);
	
	if(info.constructed != undefined) return;
	
	info.constructed = true;
	info.root = root;
	
	var _ = new PIXI.Text(info.name, {font: '26px Arial', fill: 'white'});
	_.x = 5;
	_.y = 5;
	root.addChild(_);
	
	root.all_gears = [];
	
	// all the gears that are not directly powered
	root.free_gears = [];
	
	var go_button;
	var stop_button;
	var reset_button;
	
	
	var go_stop_back = new_sprite('progress_back');
	go_stop_back.x = 5;
	go_stop_back.y = 50;
	go_stop_back.width = 60;
	go_stop_back.height = 30;
	root.addChild(go_stop_back);
	var reset_back = new_sprite('progress_back');
	reset_back.x = 70;
	reset_back.y = 50;
	reset_back.width = 90;
	reset_back.height = 30;
	root.addChild(reset_back);
	
	// GO button
	go_button = new newButton('go', 'go', 'go')
		.pos(5, 50)
		.click(function()
			{
				stop_button.visible = true;
				go_button.visible = false;
				go_gears(root);
			}).g;
	root.addChild(go_button);
	
	// STOP button
	stop_button = new newButton('stop', 'stop', 'stop')
		.pos(5, 50)
		.click(function()
			{
				stop_button.visible = false;
				go_button.visible = true;
				stop_gears(root);
			}).g;
	root.addChild(stop_button);
	
	stop_button.visible = false;
	
	// RESET button
	reset_button = new newButton('reset', 'reset', 'reset')
		.pos(70, 50)
		.click(function()
			{
				reset_level(root);
			}).g;
	root.addChild(reset_button);
	
	// build goals
	root.goals = [];
	
	var ydif = (300 / (info.goals.length + 1));
	for(var i = 0; i < info.goals.length; i++)
	{
		var g = info.goals[i];
		
		_ = new PIXI.Sprite(_tex.gear_goal);
		
		_.scale.x = g.size;
		_.scale.y = g.size;
		
		_.goal = g.rotations * 2 * 3.14159;
		_.size = g.size;
		_.powered = false;
		_.gear_type = 'goal';
		
		_.x = 400 - 50;
		_.y = 50 + ydif * (i + 1);
		_.anchor.x = 0.5;
		_.anchor.y = 0.5;
		
		
		root.addChild(_);
		
		root.goals.push(_);
		root.free_gears.push(_);
		root.all_gears.push(_);
		
		// counter
		var counter = new PIXI.Container();
		
		// counter background
		var graphics = new_sprite('progress_back');
		graphics.scale.x = 0.5;
		graphics.scale.y = 0.5;
		counter.addChild(graphics);
		
		// counter
		var progress = new PIXI.Text("", {font: "12px Arial", fill : 'white', align: 'center', wordWrap: true, wordWrapWidth: 90});
		_.progress = progress;
		progress.y = 20;
		progress.x = 5;
		
		var total = new PIXI.Text(Math.abs(g.rotations) + (g.rotations > 0 ? ' CW' : ' CCW'), {font: "12px Arial", fill: 'white'});
		_.total = total;
		total.y = 5;
		total.x = 5;
		
		counter.addChild(progress);
		counter.addChild(total);
		
		root.addChild(counter);
		counter.x = _.x - 25;
		counter.y = _.y - 25;
	}
	
	
	// build rotators
	// IE, the directly powered gears
	root.rotators = [];
	
	var ydif = (300 / (info.rotators.length + 1));
	for(var i = 0; i < info.rotators.length; i++)
	{
		var g = info.rotators[i];
		
		_ = new PIXI.Sprite(_tex.gear_start);
		
		_.scale.x = g.size;
		_.scale.y = g.size;
		
		_.size = g.size;
		
		_.speed = g.speed;
		_.powered = true;
		_.gear_type = 'rotator';
		
		_.x = 50;
		_.y = 50 + ydif * (i + 1);
		_.anchor.x = 0.5;
		_.anchor.y = 0.5;
		
		root.addChild(_);
		
		root.rotators[i] = _;
		root.all_gears.push(_);
	}
	
	// the draggable gears
	var xdif = (300 / (info.given_gears.length + 1));
	for(var i = 0; i < info.given_gears.length; i++)
	{
		var g = info.given_gears[i];
		for(var j = 0; j < g.howmany; j++)
		{
			var gear = new PIXI.Sprite(_tex.gear);
			gear.interactive = true;
			
			gear.scale.x = g.size;
			gear.scale.y = g.size;
			
			gear.size = g.size;
			gear.powered = false;
			gear.gear_type = 'drag';
			
			gear.anchor.x = 0.5;
			gear.anchor.y = 0.5;
			gear.x = 50 + xdif * (i + 1);
			gear.y = 350;
			
			gear.baseX = gear.x;
			gear.baseY = gear.y;
			
			root.addChild(gear);
			root.free_gears.push(gear);
			root.all_gears.push(gear);
			
			// closures, why do you make me resort to this
			gear.mouseover = (function(gg)
			{
				gg.mouseout = function(md)
				{
					gg.mousedown = null;
				};
				return function(md)
					{
						if(level_go == false)
							gg.mousedown = function(md)
							{
								root.removeChild(gg);
								root.addChild(gg);
								var dx = md.data.originalEvent.pageX - gg.x;
								var dy = md.data.originalEvent.pageY - gg.y;
								gg.mousemove = function(md)
								{
									var x = md.data.originalEvent.pageX - dx;
									var y = md.data.originalEvent.pageY - dy;
									gg.x = x;
									gg.y = y;
									
									gg.tint = 0xffffff;
	// check to see if it is nearby other gears
	for(var j = 0; j < root.all_gears.length; j++)
	{
		var g2 = root.all_gears[j];
		if(g2 != gg) // we don't want to power ourselves
		{
			var dist2 = (Math.pow(g2.x - gg.x, 2) + Math.pow(g2.y - gg.y, 2));
			var rad2 = Math.pow(42*gg.size + 42*g2.size, 2);
			
			// if their distance is within N pixels of their added radii
			if(Math.abs(dist2 - rad2) <= gear_teeth_contact*gear_teeth_contact)
			{
				//draw_circle((gg.x+g2.x)/2, (gg.y+g2.y)/2, 10, 'red');
				if(gg.connected_to[g2._name] == undefined || gg.connected_to[g2._name] == false)
				{
					gg.connected_to[g2._name] = g2;
					PIXI.audioManager.getAudio("connect.mp3").play();
				}
				
			}
			else if(dist2 < gear_center_contact*gear_center_contact) // if their centers are within N pixels, then bind their angular velocities
			{
				gg.tint = 0xff99ff;
				if(g2.powered == false && g2.gear_type != 'goal')
					g2.tint = 0xff99ff;
			}
			else if(gg.connected_to[g2._name] != undefined && gg.connected_to[g2._name] != false)
			{
				gg.connected_to[g2._name] = false;
			}
		}
	}
								};
								gg.mouseup = function(md)
								{
									gg.mousemove = null;
								};
							};
					};
			})(gear);
		}
	}
	
	for(var i = 0; i < root.all_gears.length; i++)
	{
		var g = root.all_gears[i];
		
		g.angular_velocity = 0;
		g.locked = false;
		
		g.powered_by = null;
		
		g.connected_to = {};
		g._name = "gear" + i;
	}
	
	// some text explaining what to do
	if(levelid == 1)
	{
		var tut1 = new PIXI.Text("Drag these", {font: "12px Arial", fill: 'black'});
		tut1.x = 5;
		tut1.y = 350;
		root.addChild(tut1);
		
		var tut2 = new PIXI.Text("This one rotates\n automatically", {font: "12px Arial", fill: 'black'});
		tut2.x = 5;
		tut2.y = 255;
		root.addChild(tut2);
	}
	if(levelid == 3)
	{
		var tut2 = new PIXI.Text("Gears have a little\nleeway with how\nprecisely they are lined up.", {font: "12px Arial", fill: 'black'});
		tut2.x = 5;
		tut2.y = 255;
		root.addChild(tut2);
	}
	
}

state_stack.push('top');
animate();







