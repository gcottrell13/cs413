


var elements = {
	END : new newText("Time's Up!", {font : '34px Arial', fill : 'black', align : 'center', wordWrap : true, wordWrapWidth : 200})
		.pos(100, 100),
	button : new newButton('red', 'pink', 'green')
		.click(function(md){
			})
		.pos(100, 200),
	
	start_game_button : new newButton('sg_up', 'sg_hd', 'sg_hd')
		.click(function(md)
			{
				start();
			})
		.pos(100, 195),
	
	credits_button : new newButton('credits_up', 'credits_hd', 'credits_hd')
		.click(function(md)
			{
				state_stack.push('credits');
			})
		.pos(100, 300),
	
	credits_text : new newText("Art and sound by Gage Cottrell (c) 2016",
		{font : '34px Arial', fill : 'white', align : 'center', wordWrap : true, wordWrapWidth : 300})
		.pos(50, 100),
	
	back_button_credits : new newButton('back_up', 'back_hd', 'back_hd')
		.click(function(md)
			{
				if(state_stack.is_empty() == false)
					state_stack.pop();
			})
		.pos(5, 295),
		
	back_button_game : new newButton('back_up', 'back_hd', 'back_hd')
		.click(function(md)
			{
				if(state_stack.is_empty() == false)
					state_stack.pop();
			})
		.pos(5, 295)
};

//
var states = {
	top : construct_graph(new PIXI.Container(0x0, true))
		.down()
		.create('start_game_button')
		.create('credits_button')
	.end(),
	
	credits : construct_graph(new PIXI.Container(0, false))
		.down()
		.create('credits_text')
		.create('back_button_credits')
	.end(),
	
	game : construct_graph(new PIXI.Container(0, true))
		.down()
		.create('back_button_game')
	.end()
};





function newButton(up, hover, down)
{
	this.gup = new_sprite(up);
	this.gdown = new_sprite(down);
	this.ghover = new_sprite(hover);
	
	this.g = new PIXI.Sprite();
	this.g.interactive = true;
	this.g.buttonMode = true;
	
	this.g.addChild(this.gup);
	this.g.addChild(this.gdown);
	this.g.addChild(this.ghover);
	
	this.pos = function(x, y)
	{
		this.g.x = x;
		this.g.y = y;
		return this;
	};
	
	this.click = function(cb)
	{
		this.g.click = cb;
		return this;
	};
	
	var me = this;
	
	var state = 'up';
	this.g.mouseover = function(md)
	{
		me.gdown.visible = false;
		me.gup.visible = false;
		me.ghover.visible = true;
		state = 'hover';
	};
	this.g.mouseout = function(md)
	{
		me.gdown.visible = false;
		me.gup.visible = true;
		me.ghover.visible = false;
		state = 'up';
	};
	this.g.mousedown = function(md)
	{
		if(state != 'hover') return;
		me.gdown.visible = true;
		me.gup.visible = false;
		me.ghover.visible = false;
		state = 'down';
	};
	this.g.mouseup = function(md)
	{
		if(state != 'down') return;
		me.gdown.visible = false;
		me.gup.visible = false;
		me.ghover.visible = true;
		state = 'hover';
	};
	
	this.g.mouseout(null);
}

function newSprite(tx_name)
{
	this.g = new_sprite(tx_name);
	this.pos = function(x, y)
	{
		this.g.x = x;
		this.g.y = y;
		return this;
	};
	this.anchor = function(x, y)
	{
		this.g.anchor.x = x;
		this.g.anchor.y = y;
		return this;
	};
}

function newText(txt, params)
{
	this.g = new PIXI.Text(txt, params);
	this.pos = function(x, y)
	{
		this.g.x = x;
		this.g.y = y;
		return this;
	};
}

function construct_graph(root)
{
	var stage = root;
	var s = new stackhelper();
	
	s.push({g : stage});
	
	var _;
	_ = function()
	{
		return {
			// creates a sibling
			create : function(em_name)
			{
				s.pop();
				s.get_top().g.addChild(elements[em_name].g);
				s.push(elements[em_name]);
				return _();
			},
			up : function()
			{
				s.pop();
				return _();
			},
			down : function()
			{
				s.push('$DOWN$');
				return _();
			},
			end : function()
			{
				return stage;
			}
		};
	};
	return _();
}


