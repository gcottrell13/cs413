
PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

var bg_music;

var _tex = {};
function load_texture_path(path, name)
{
	var t = PIXI.Texture.fromImage(path);
	_tex[name] = t;
}
function load_texture_frame(frame, name)
{
	var t = PIXI.Texture.fromFrame(frame);
	_tex[name] = t;
}
function new_sprite(tx_name)
{
	var s = new PIXI.Sprite(_tex[tx_name]);
	return s;
}


PIXI.loader
  .add("map_json", "map.json")
  .add('tileset', 'tileset.png')
  .add('frog.json')
  .load(function ()
{
	
	load_texture_path('dat/startgame_hover.png', 'sgh');
	load_texture_path('dat/startgame_up.png', 'sgu');
	
	load_texture_path('dat/frog_hop.png', 'frog_hop');
	
	layouts();
	
	state_stack.push('main');
	animate();
});

