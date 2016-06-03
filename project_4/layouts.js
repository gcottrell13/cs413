function layouts()
{
	var sgparams = {font : '31px Verdana', fill : 'white'};
	var sgtext = "Start Game";
	elements = {
		
		gamebg_container: new newContainer(),
		gamebg : new newSprite("background")
			.scale(3, 3),
		points_bg : new newSprite("points_bg")
			.scale(2, 2),
		
		game_name : new newText("Air Raid!", {font : '34px Verdana', fill : 'white'})
			.pos(100, 100),
		
		menubg : new newSprite("background")
			.scale(3, 3),
		pausebg_container: new newContainer(),
		pausebg : new newSprite("background")
			.scale(3, 3),
		
		paused_text : new newText("Paused", {font : '34px Verdana', fill : 'white', align : 'center', wordWrap : true, wordWrapWidth : 300})
			.pos(50, 100),
		unpause_button : new newButton()
			.up_text('Return to game', sgparams)
			.down_text('Return to game', sgparams)
			.hover_text('Return to game', sgparams)
			.pos(50, 200)
			.click(function()
				{
					state_stack.pop();
					game_tick();
				}),
		pause_backtomenu_button : new newButton()
			.up_text('Back to the menu (you will lose all progress!)', sgparams)
			.down_text('Back to the menu (you will lose all progress!)', sgparams)
			.hover_text('Back to the menu (you will lose all progress!)', sgparams)
			.pos(50, 250)
			.click(function()
				{
					state_stack.pop();
					state_stack.pop();
					game_state = 'none';
				}),
		
		credits_text : new newText("Art and sound by Gage Cottrell (c) 2016",
			{font : '34px Verdana', fill : 'white', align : 'center', wordWrap : true, wordWrapWidth : 300})
			.pos(50, 100),
		credits_back : new newButton()
			.up_text('Back', sgparams)
			.down_text('Back', sgparams)
			.hover_text('Back', sgparams)
			.pos(50, 200)
			.click(function()
				{
					state_stack.pop();
					game_tick();
				}),
		
		points : new newText("",
			{font : '25px Verdana', fill : 'black', align : 'center', wordWrap : true, wordWrapWidth : 300})
			.pos(10, 10),
		points_extra : new newText("",
			{font : '20px Verdana', fill : 'black', align : 'center', wordWrap : true, wordWrapWidth : 300})
			.pos(10, 50),
		
		instructions : new newText(
			"How to play:\n\n" +
			"Controls:\n" +
			"- Press or hold W to nudge the plane upward (relative to the plane)\n" +
			"   Gravity will increase or decrease your speed automatically, depending on whether " +
			"you are flying up or down\n" +
			"- Press D to flip the plane\n" +
			"   This can be used for acrobatic maneuvers and cool tricks!\n" +
			"- Press A to slow the plane down\n" +
			"   But be careful, losing too much speed can cause you to stall\n\n" +
			"Goals: \n" +
			"- Collect the points\n" + 
			"- Make it to the striped line at the end of the level to win\n" +
			"   But be sure to get as many points along the way as possible!",
			{font : '16px Verdana', fill : 'white', wordWrap: true, wordWrapWidth: 400})
			.pos(350, 5),
		
		game_ui_container : new newContainer(),
		game_points_container: new newContainer(),
		game_viewport_container: new newContainer(),
		
		level_complete : new newText("", {font: "20px Verdana", fill: "white"})
			.pos(50, 150),
		level_next : new newText("", {font: "20px Verdana", fill: "white"})
			.pos(275, 150),
		
		startgame : new newButton()
			.pos(100, 200)
			.up_text(sgtext, sgparams)
			.down_text(sgtext, sgparams)
			.hover_text(sgtext, sgparams)
			.click(function()
				{
					state_stack.push('instructions');
					//start();
				}),
		
		try_again : new newButton()
			.pos(50, 350)
			.up_text("Again!", sgparams)
			.down_text("Again!", sgparams)
			.hover_text("Again!", sgparams)
			.click(function()
				{
					elements.game_ui_container.g.visible = false;
					elements.try_again.g.visible = false;
					load_level(1);
					viewport.x = 0;
					viewport.y = 0;
					points = 0;
					powerup_chain = 0;
					game_state = 'play';
				}),
		
		inst_start_button : new newButton()
			.pos(100, 200)
			.up_text(sgtext, sgparams)
			.down_text(sgtext, sgparams)
			.hover_text(sgtext, sgparams)
			.click(function()
				{
					state_stack.push('game');
					start();
				})
	};
	
	templates.post_process();
	
	states = {
		pause : construct_graph(new PIXI.Container(0, true))
			.down()
			.create('pausebg_container')
				.down()
				.create('pausebg')
				.up()
			.create('paused_text')
			.create('unpause_button')
			.create('pause_backtomenu_button')
		.end(),
		game : construct_graph(new PIXI.Container(0x0, true))
			.down()
			.create('gamebg_container')
				.down()
				.create('gamebg')
				.up()
			.create('game_viewport_container')
			.create('game_ui_container')
				.down()
				.create('level_complete')
				.create('level_next')
				.create('try_again')
				.up()
			.create('game_points_container')
				.down()
				.create('points_bg')
				.create('points')
				.create('points_extra')
				.up()
		.end(),
		
		credits : construct_graph(new PIXI.Container(0, false))
			.down()
			.create('credits_back')
			.create('credits_text')
		.end(),
		
		level_choose : construct_graph(new PIXI.Container(0, true))
			.down()
		.end(),
		
		instructions : construct_graph(new PIXI.Container(0, true))
			.down()
			.create('instructions')
			.create('inst_start_button')
		.end(),
		
		main : construct_graph(new PIXI.Container(0, true))
			.down()
			.create('menubg')
			.create('game_name')
			.create('startgame')
		.end(),
		
		done : construct_graph(new PIXI.Container(0, true))
			.down()
		.end()
	};
}