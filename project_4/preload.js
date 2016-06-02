
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
  .add('tileset', 'tileset.png')
  .add("map1_json", "map1.json")
  .add("map2_json", "map2.json")
  .add("map3_json", "map3.json")
  .load(function ()
{
	load_texture_path('dat/background.png', 'background');
	load_texture_path('dat/points_bg.png', 'points_bg');
	load_texture_path('dat/point.png', 'point');
	load_texture_path('dat/airplane.png', 'airplane_spritesheet');
	
	layouts();
	
	/*
	bg_music = PIXI.audioManager.getAudio("froggening.mp3");
	bg_music.loop = true;
	bg_music.volume = 0.40;
	bg_music.play();
	*/
	
	state_stack.push('main');
	animate();
	
	if(getCookie('airraid_highscore') == '')
	{
		setCookie('airraid_highscore', 0, 100);
	}
	
});

var explosion_emitter = {
	"alpha": {
		"start": 1,
		"end": 0
	},
	"scale": {
		"start": 0.3,
		"end": 0.001,
		"minimumScaleMultiplier": 1
	},
	"color": {
		"start": "#ffffff",
		"end": "#ff3d71"
	},
	"speed": {
		"start": 50,
		"end": 100
	},
	"acceleration": {
		"x": 0,
		"y": 5
	},
	"startRotation": {
		"min": 0,
		"max": 0
	},
	"rotationSpeed": {
		"min": 0,
		"max": 1
	},
	"lifetime": {
		"min": 30,
		"max": 40
	},
	"blendMode": "normal",
	"frequency": 0.002,
	"emitterLifetime": 0.1,
	"maxParticles": 500,
	"pos": {
		"x": 0,
		"y": 0
	},
	"addAtBack": false,
	"spawnType": "point"
};


