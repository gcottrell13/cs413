function layouts()
{
	var sgparams = {font : '34px Verdana', fill : 'white'};
	var sgtext = "Start Game";
	elements = {
		
		gamebg : new newSprite("background")
			.scale(3, 3),
		points_bg : new newSprite("points_bg")
			.scale(2, 2),
		
		credits_text : new newText("Art and sound by Gage Cottrell (c) 2016",
			{font : '34px Verdana', fill : 'white', align : 'center', wordWrap : true, wordWrapWidth : 300})
			.pos(50, 100),
		
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
			"- Collect the points and powerups\n" + 
			"- Make it to the striped line at the end of the level to win!",
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
			.pos(100, 200)
			.up_text(sgtext, sgparams)
			.down_text(sgtext, sgparams)
			.hover_text(sgtext, sgparams)
			.click(function()
				{
					state_stack.pop();
					start();
				}),
		inst_start_button : new newButton()
			.pos(100, 300)
			.up_text(sgtext, sgparams)
			.down_text(sgtext, sgparams)
			.hover_text(sgtext, sgparams)
			.click(function()
				{
					start();
					state_stack.push('game');
				})
	};
	
	templates.post_process();
	
	states = {
		
		game : construct_graph(new PIXI.Container(0x0, true))
			.down()
			.create('gamebg')
			.create('game_viewport_container')
			.create('game_ui_container')
				.down()
				.create('level_complete')
				.create('level_next')
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
			.create('startgame')
		.end(),
		
		done : construct_graph(new PIXI.Container(0, true))
			.down()
		.end()
	};
}