var levels = [];
var num_levels = 3;

levels[1] = {
	name: 'The First',
	goals: [
		{size: 1, rotations: 1},
		{size: 1, rotations: -2}
	],
	rotators: [
		{size: 1, speed: 1}
	],
	given_gears: [
		{howmany: 3, size: 1},
		{howmany: 1, size: 0.5}
	]
};

levels[2] = {
	name: 'Elementary',
	goals: [
		{size: 1, rotations: 1},
		{size: 1, rotations: 1},
		{size: 1, rotations: 1},
		{size: 1, rotations: 1}
	],
	rotators: [
		{size: 1, speed: 2}
	],
	given_gears: [
		{howmany: 5, size: 1}
	]
};

levels[3] = {
	name: 'Ratios',
	goals: [
		{size: 1, rotations: 70}
	],
	rotators: [
		{size: 1, speed: 1}
	],
	given_gears: [
		{howmany: 4, size: 1},
		{howmany: 5, size: 0.5}
	]
};

