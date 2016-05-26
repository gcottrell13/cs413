function layouts()
{

	elements = {
		
		levelselect : new newText("Level Selection", {font : '34px Arial', fill : 'white'})
			.pos(20, 10),
		
		
		credits_text : new newText("Art and sound by Gage Cottrell (c) 2016",
			{font : '34px Arial', fill : 'white', align : 'center', wordWrap : true, wordWrapWidth : 300})
			.pos(50, 100),
		
		instructions : new newText(
			"How to play:\n" +
			"- Get the orange gears to spin up to 100%! \n" +
			"- They each have different requirements for how far\nthey have to spin.\n" +
			"- Use the grey gears to do that, " +
			"but you can only\nmodify their arrangement when the\nmechanism isn't running.\n" +
			"- Put gears on top of each other to make them rotate\nwith the same speed.",
			{font : '16px Arial', fill : 'black'})
			.pos(5, 5),
		
		level_complete : new newText("Level Complete!\nTry the next one!", {font: "20px Arial", fill: "white"})
			.pos(125, 150),
		
		startgame : new newButton('sgu', 'sgh', 'sgh')
			.click(function()
				{
					state_stack.push('top');
					start();
				})
	};

	states = {
		
		top : construct_graph(new PIXI.Container(0x0, true))
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
			.create('startgame')
		.end(),
		
		level_complete : construct_graph(new PIXI.Container(0, true))
			.down()
		.end()
	};
}