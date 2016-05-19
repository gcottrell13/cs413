


var elements = {
	END : new newText("Time's Up!", {font : '34px Arial', fill : 'black', align : 'center', wordWrap : true, wordWrapWidth : 200, x : 100})
		.pos(100, 100)
};

//
var states = {
	top : construct_graph()
		.down()
		.create('END')
	.end()
};








function newSprite(tx_name)
{
	this.g = new_sprite(tx_name);
	this.pos = function(x, y)
	{
		this.g.x = x;
		this.g.y = y;
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

function construct_graph()
{
	var stage = new PIXI.Container();
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
				console.log(s.get_top());
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


var _tex = {};
function load_texture_path(path, name)
{
	var t = PIXI.Texture.fromImage(path);
	_tex[name] = t;
}
function new_sprite(tx_name)
{
	var s = new PIXI.Sprite(_tex[tx_name]);
	return s;
}

