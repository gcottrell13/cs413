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
			"- Use the WASD keys to move around! \n" +
			"The corridors will try their best\nto trick you...",
			{font : '16px Arial', fill : 'white'})
			.pos(5, 5),
		
		level_complete : new newText("Level Complete!\nTry the next one!", {font: "20px Arial", fill: "white"})
			.pos(125, 150),
		
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