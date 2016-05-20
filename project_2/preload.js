
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


load_texture_path("dat/apple_green_good.png", "green");
load_texture_path("dat/apple_pink_good.png", "pink");
load_texture_path("dat/apple_red_good.png", "red");

load_texture_path("dat/startgame_up.png", "sg_up");
load_texture_path("dat/startgame_hover.png", "sg_hd");

load_texture_path("dat/back_up.png", "back_up");
load_texture_path("dat/back_hover.png", "back_hd");

load_texture_path("dat/credits_up.png", "credits_up");
load_texture_path("dat/credits_hover.png", "credits_hd");


