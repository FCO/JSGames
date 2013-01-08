function ElementFactory(eid) {
	if(eid) this.eid = eid;
}

ElementFactory.last_eid = 0;

ElementFactory.prototype = {
	
};

var ElementPrototype = {
	init:	function() {
		throw "Please, implement the 'init' method.";
	},
	concat:	function(prototype) {
		for(var key in prototype) {
			if(prototype.hasOwnProperty(key)) {
				this[key] = prototype[key];
			}
		}
	},
	draw:	function() {
		throw "Please, implement the 'draw' method.";
	},
};

var WorkerElement	= ElementFactory.concat({
	init:	function(world) {
		this.world	= world;
		this.points	= [];
	}
	path:	function() {
		var path = [];
		if(this.points) {
			path.push({moveTo: this.points[0].toArray()});
			for(var i = 0; i < this.points.length; i++) {
				path.push({lineTo: this.points[i].toArray()})
			}
		}
		return path;
	},
});

var ScreenElement	= ElementFactory.concat({
	init:	function(screen) {
		this.screen = screen;
	},
});

function Point(x, y) {
	if(x) this._x = x;
	if(y) this._y = y;
	this.setCardinal(this._x, this._y);
}

Point.prototype = {
	_x:	0,
	_y:	0,
	_mod:	0,
	_ang:	0,
	setCardinal:	function(x, y) {
		this._mod = Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 1 / 2)
		this._ang = Math.atan2(x, y);
	},
	setVector: function(ang, mod) {
		this._x = Math.sin(ang) * mod;
		this._y = Math.cos(ang) * mod;
	},
	set x(value) {
		this._x = value;
		this.setCardinal(this._x, this._y);
	},
	set y(value) {
		this._y = value;
		this.setCardinal(this._x, this._y);
	},
	get x() {
		return this._x;
	},
	get y() {
		return this._y;
	},
	set ang(value) {
		this._ang = ang;
		this.setVector(this._ang, this._mod);
	},
	set mod(value) {
		this._mod = mod;
		this.setVector(this._ang, this._mod);
	},
	get ang() {
		return this._ang;
	},
	get mod() {
		return this._mod;
	},

	path:	function(){
		return [
			{moveTo: [-5,  5]},
			{lineTo: [ 5, -5]},
			{moveTo: [-5, -5]},
			{lineTo: [ 5,  5]}
		];
	},
	times:	function(number) {
		var tmp = new Point();
		tmp.init(this.x * number, this.y * number);
		return tmp;
	},
	toArray:	function() {
		return [this.x, this.y];
	}
};
