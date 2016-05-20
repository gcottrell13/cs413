


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
	var me = this;
	this.click = function(cb)
	{
		this.g.click = function(md)
		{
			me.gdown.visible = false;
			me.gup.visible = true;
			me.ghover.visible = false;
			cb(md);
		};
		return this;
	};
	this.anchor = function(x, y)
	{
		this.g.anchor.x = x;
		this.g.anchor.y = y;
		return this;
	};
	
	button_func(this);
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




function button_func(me)
{
	
	var state = 'up';
	me.g.mouseover = function(md)
	{
		me.gdown.visible = false;
		me.gup.visible = false;
		me.ghover.visible = true;
		state = 'hover';
	};
	me.g.mouseout = function(md)
	{
		me.gdown.visible = false;
		me.gup.visible = true;
		me.ghover.visible = false;
		state = 'up';
	};
	me.g.mousedown = function(md)
	{
		if(state != 'hover') return;
		me.gdown.visible = true;
		me.gup.visible = false;
		me.ghover.visible = false;
		state = 'down';
	};
	me.g.mouseup = function(md)
	{
		if(state != 'down') return;
		me.gdown.visible = false;
		me.gup.visible = false;
		me.ghover.visible = true;
		state = 'hover';
	};
	
	me.g.mouseout(null);
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


