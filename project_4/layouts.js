function layouts()
{

	elements = {
		
		gamebg : new newSprite("background")
			.scale(2, 2),
		
		credits_text : new newText("Art and sound by Gage Cottrell (c) 2016",
			{font : '34px Arial', fill : 'white', align : 'center', wordWrap : true, wordWrapWidth : 300})
			.pos(50, 100),
		
		instructions : new newText(
			"How to play:\n" +
			"- Press or hold W to nudge the plane upward \n" +
			"- Press A or D to flip the plane\n" +
			"- Make it to the striped line at the end of the level to win!",
			{font : '16px Arial', fill : 'white', wordWrap: true, wordWrapWidth: 600})
			.pos(5, 5),
		
		game_ui_container : new newContainer(),
		
		level_complete : new newText("", {font: "20px Arial", fill: "white"})
			.pos(50, 150),
		level_next : new newText("", {font: "20px Arial", fill: "white"})
			.pos(250, 150),
		
		startgame : new newButton('sgu', 'sgh', 'sgh')
			.pos(100, 200)
			.click(function()
				{
					state_stack.push('instructions');
					start();
				}),
		
		try_again : new newButton('sgu', 'sgh', 'sgh')
			.pos(100, 200)
			.click(function()
				{
					state_stack.pop();
					start();
				}),
		inst_start_button : new newButton('sgu', 'sgh', 'sgh')
			.pos(100, 200)
			.click(function()
				{
					start();
					state_stack.push('game');
				})
	};

	states = {
		
		game : construct_graph(new PIXI.Container(0x0, true))
			.down()
			.create('game_ui_container')
				.down()
				.create('level_complete')
				.create('level_next')
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
		.end(),
		
		main : construct_graph(new PIXI.Container(0, true))
			.down()
		.end(),
		
		done : construct_graph(new PIXI.Container(0, true))
			.down()
		.end()
	};
}