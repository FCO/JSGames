function log(msg){window.console.log(msg)};

function ElementFactory(type) {
	if(type != "screen" && type != "world")
		throw "The ElementFactory type must be 'screen' or 'world'.";
	this.type = type;
	//this[type] = eval(type);
	this[type] = {};
}

ElementFactory.last_eid = 0;

ElementFactory.elementPrototype = {
	eid:	0,
	init:	function() {
		this[this.type]	= this.factory[this.factory.type];
		this.center	= new Point(0, 0);
		if(this.postInit) this.postInit(arguments);
		if(this.afterInit) this.afterInit(arguments);
	},
	sendCmd:	function(cmd, attrs) {
		//this[this.type].sendCmd(cmd, attrs);
	},
	concat:	function() {
		var clone = {};
		for(var key in this) {
			if(this.hasOwnProperty(key)) {
				clone[key] = this[key];
			}
		}
		for(var i = 0; i < arguments.length; i++) {
			var prototype = arguments[i];
			for(var key in prototype) {
				if(prototype.hasOwnProperty(key)) {
					clone[key] = prototype[key];
				}
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
	},
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

MetaClass = {
	createAttribute:	function(name, pars) {
		log("Creating attribute: " + name);
		if(!this.__real_values)
			this.__real_values = {};
		var flag_is		= 0;
		var is			= pars["is"] || "rw";
		var value_default	= pars["default"];

		var r = Math.pow(2, 0);
		var w = Math.pow(2, 1);

		if(is.match(/r/)) flag_is |= r;
		if(is.match(/w/)) flag_is |= w;
		
		if(flag_is & r)
			this.__defineGetter__(name, function() {
				return this.__real_values[name];
			});
		if(flag_is & w)
			this.__defineSetter__(name, function(value) {
				this.__real_values[name] = value;
				this.meta("updateField", name, value);
			});
		if(value_default)
			this.__real_values[name] = value_default;
	},
	createMethod:	function(name, func) {
		log(this);
		this.afterInit = function() {
			this.onWorld(function(){
				this[name] = func;
			});
			this.onScreen(function(){
				this[name] = function() {
					this.sendCmd(name, arguments);
				};
			});
		};
	}
};

ElementFactory.setMetaClass = function(new_class, prototype, onset) {
	new_class.prototype = prototype;
	for(var key in MetaClass)
		new_class.prototype[key] = MetaClass[key];
	onset.call(new_class.prototype);
};

ElementFactory.prototype = {
	metaFunctions:	{
		updateField:		function(field, value) {
			this.sendCmd("setField", field, value);
		},
		setField:		function(field, value) {
			this.__real_values[field] = value;
		},
	},
	__real_values:	{},
	meta:	function() {
		var args = [];
		for(var i = 0; i < arguments.length; i++)
			args.push(arguments[i]);
		var func = args.shift();
		this.metaFunctions[func].apply(args);
	},
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
		var skip	= 0;
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
		new_element.init(arguments);
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
		this.UL = new Point(min_x, min_y);
		this.UR = new Point(min_x, max_y);
		this.DR = new Point(max_x, max_y);
		this.DL = new Point(max_x, min_y);
	});
}

ElementFactory.setMetaClass(CalcRectangle, {
	},
	function(){
		this.createAttribute("UR", {is: "rw", default: new Point(0, 0)});
		this.createAttribute("UL", {is: "rw", default: new Point(0, 0)});
		this.createAttribute("DR", {is: "rw", default: new Point(0, 0)});
		this.createAttribute("DL", {is: "rw", default: new Point(0, 0)});

		this.createMethod("path", function(){
			return [
				{moveTo: this.UL.toArray()},
				{lineTo: this.UR.toArray()},
				{lineTo: this.DR.toArray()},
				{lineTo: this.DL.toArray()},
				{lineTo: this.UL.toArray()},
			];
		}
	);
});

