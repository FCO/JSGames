function ElementFactory(type) {
	if(type != "screen" && type != "world")
		throw "The ElementFactory type must be 'screen' or 'world'.";
	this.type = type;
	this[type] = eval(type);
}

ElementFactory.last_eid = 0;

ElementFactory.elementPrototype = {
	eid:	0,
	init:	function() {
		this[this.type]	= this.factory[type];
		this.center	= new Point(0, 0);
		if(this.postInit) this.postInit(arguments);
	},
	sendCmd:	function(cmd, attrs) {
		this[this.type].sendCmd(cmd, attr);
	},
	concat:	function(prototype) {
		var clone = {};
		if(!prototype)
			prototype = {};
		for(var key in this) {
			if(this.hasOwnProperty(key)) {
				clone[key] = this[key];
			}
		}
		for(var key in prototype) {
			if(prototype.hasOwnProperty(key)) {
				clone[key] = prototype[key];
			}
		}
		return clone;
	},
	onScreen:	function(func) {},
	onWorld:	function(func) {},
	draw:	function() {
		throw "Please, implement the 'draw' method.";
	},
	move:	function() {
		throw "Please, implement the 'move' method.";
	}
};

ElementFactory.worldPrototype	= ElementFactory.elementPrototype.concat({
	onWorld:	function(func) {
		func.call(this);
	},
	path:	function() {
		var path = [];
		if(this.points && this.points.length > 0) {
			path.push({moveTo: this.points[0].toArray()});
			for(var i = 0; i < this.points.length; i++) {
				path.push({lineTo: this.points[i].toArray()})
			}
		}
		return path;
	},
	postInit:	function() {
		this.sendCmd({createElement: arguments})
	},
});

ElementFactory.screenPrototype	= ElementFactory.elementPrototype.concat({
	onScreen:	function(func) {
		func.call(this);
	},
});


ElementFactory.prototype = {
	getNewEid:	function() {
		return ElementFactory.last_eid += (this.type == "screen") ? 1 : -1;
	},
	getElementPrototype:	function() {
		return this.type == "screen" ? ElementFactory.screenPrototype : ElementFactory.worldPrototype;
	},
	createElement:	function() {
		var eid;
		var args        = [null];
		var type        = arguments[0];
		var skip	= 1;
		if(type.constructor != Function) {
			eid = type;
			type = arguments[1];
			skip++;
		}
		for(var i = 1 + skip; i < arguments.length; i++)
			args.push(arguments[i]);

		var old_prototype = type.prototype;
		type.prototype = this.getElementPrototype().concat(old_prototype);
		var new_element = new (Function.prototype.bind.apply(type, args));
		new_element.eid = eid ? eid : this.getNewEid();
		new_element.factory = this;
		args.shift();
		new_element.init(this[this.type]);
		return new_element;
	},
};

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

function CalcRectangle(min_x, max_x, min_y, max_y) {
	this.onWorld(function() {
		this.points = [];
		this.points.push(new Point(min_x, min_y));
		this.points.push(new Point(min_x, max_y));
		this.points.push(new Point(max_x, max_y));
		this.points.push(new Point(max_x, min_y));
	});
}

CalcRectangle.prototype = {};
