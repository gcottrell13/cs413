
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


load_texture_path("dat/startgame_backprint.png", "sg_backprint");
load_texture_path("dat/gear_base.png", "gear");
load_texture_path("dat/gear_goal.png", "gear_goal");
load_texture_path("dat/gear_start.png", "gear_start");

load_texture_path("dat/go.png", "go");
load_texture_path("dat/stop.png", "stop");
load_texture_path("dat/reset.png", "reset");

load_texture_path("dat/progress_back.png", "progress_back");

load_texture_path("dat/bg.png", "bg");

PIXI.loader
  .add("blip.mp3")
  .add("connect.mp3")
  .add("mechanisms.mp3")
  .add("data.json")
  .load(function ()
{
	load_texture_frame("apple_green_good.png", "green");
	load_texture_frame("apple_pink_good.png", "pink");
	load_texture_frame("apple_red_good.png", "red");

	load_texture_frame("startgame_up.png", "sg_up");
	load_texture_frame("startgame_hover.png", "sg_hd");

	load_texture_frame("back_up.png", "back_up");
	load_texture_frame("back_hover.png", "back_hd");

	load_texture_frame("credits_up.png", "credits_up");
	load_texture_frame("credits_hover.png", "credits_hd");
	
	
	bg_music = PIXI.audioManager.getAudio("mechanisms.mp3");
	bg_music.loop = true;
	bg_music.volume = 0.40;
	bg_music.play();
	
	layouts();
	
});

