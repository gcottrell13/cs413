

var templates = {};
templates.button = function(up, hover, down)
{
	var px = 0;
	var py = 0;
	var sx = 0;
	var sy = 0;
	this.create = function()
	{
		return new newButton(up, hover, down);
	};
};
templates.sprite = function(tx_name)
{
};
templates.text = function(text, params)
{
	
};
templates.textbutton = function(text, params)
{
	
};

templates.post_process_queue = [];
templates.post_process = function()
{
	for(var i = 0; i < templates.post_process_queue.length; i++)
	{
		var e = templates.post_process_queue[i];
		e[1].apply(e[0]);
	}
};

function newContainer()
{
	this.g = new PIXI.Container();
	basic_func(this);
}
function newButton(up, hover, down)
{
	if(up != undefined)
	{
		this.gup = new_sprite(up);
		this.g.addChild(this.gup);
	}
	if(hover != undefined)
	{
		this.ghover = new_sprite(hover);
		this.g.addChild(this.ghover);
	}
	if(down != undefined)
	{
		this.gdown = new_sprite(down);
		this.g.addChild(this.gdown);
	}
	
	this.g = new PIXI.Sprite();
	this.g.interactive = true;
	this.g.buttonMode = true;
	
	
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
	
	this.up_text = function(t, p)
	{
		if(p == undefined) // t is an element name
			this.set_state_text('up', t);
		else
		{
			if(this.gup != undefined) this.g.removeChild(this.gup);
			this.gup = new newText(t, p).g;
			this.g.addChild(this.gup);
		}
		return this;
	};
	this.hover_text = function(t, p)
	{
		if(p == undefined) // t is an element name
			this.set_state_text('hover', t);
		else
		{
			if(this.ghover != undefined) this.g.removeChild(this.ghover);
			this.ghover = new newText(t, p).g;
			this.g.addChild(this.ghover);
		}
		return this;
	};
	this.down_text = function(t, p)
	{
		if(p == undefined) // t is an element name
			this.set_state_text('down', t);
		else
		{
			if(this.gdown != undefined) this.g.removeChild(this.gdown);
			this.gdown = new newText(t, p).g;
			this.g.addChild(this.gdown);
		}
		return this;
	};
	this.set_state_text = function(s, em)
	{
		return this;
	};
	
	button_func(this);
	
	basic_func(this);
}

function newSprite(tx_name)
{
	this.g = new_sprite(tx_name);
	basic_func(this);
	
	this.new_sprite = function(tx_name)
	{
		var p = this.g.parent;
		p.removeChild(this.g);
		var g = new_sprite(tx_name);
		p.addChild(g);
		g.x = this.g.x;
		g.y = this.g.y;
		g.scale.x = this.g.scale.x;
		g.scale.y = this.g.scale.y;
		g.anchor.x = this.g.anchor.x;
		g.anchor.y = this.g.anchor.y;
		
		this.g = g;
	};
}

function newText(txt, params)
{
	this.g = new PIXI.Text(txt, params);
	this.p = params;
	this.t = txt;
	basic_func(this);
}



function basic_func(me)
{
	
	me.on = function(em, cb)
	{
		me.g.on(em, cb);
		return me;
	};
	me.pos = function(x, y)
	{
		me.g.x = x;
		me.g.y = y;
		return me;
	};
	me.anchor = function(x, y)
	{
		me.g.anchor.x = x;
		me.g.anchor.y = y;
		return me;
	};
	me.scale = function(xs, ys)
	{
		me.g.scale.x = xs;
		me.g.scale.y = ys;
		return me;
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
	
	me.done = function()
	{
		templates.post_process_queue.push([me, function()
		{
			this.g.mouseout(null);
		}]);
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


