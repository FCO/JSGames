function ElementFactory() {
	this.elements = [];
	this.elements_by_id = {};
}

ElementFactory.last_eid = -1;

ElementFactory.prototype = {
	getElementById:	function(id) {
		return this.elements_by_id[id];
	},
	world:		{
		pointToPixel:	function(point) {
			return point;
		},
		sizeToPixel:	function(size) {
			return size;
		},
	},
	log: 		function(msg) {
		console.log(msg);
	},
	createElement:	function() {
		var args	= [];
		var my_args	= [];
		var eid		= arguments[0];
		this.log("eid : " + eid);
		if(!eid) {
			eid = ElementFactory.last_eid--;
		}
		var type	= arguments[1];
		this.log("type: " + type);
		args[0]		= null;
		for(var i = 2; i < arguments.length; i++) {
			args.push(arguments[i]);
			my_args.push(arguments[i]);
		}
		this.log("type: " + type);
		this.log("CreateElement(" + type + ", " + my_args  + ")");
		var element = new (Function.prototype.bind.apply(eval(type), args));
		element.eid = eid;
		this.elementBase(element);
		if(element.init)
			element.init.apply(element, my_args);
		this.elements.push(element);
		this.elements_by_id[eid] = element;
		return element;
	},
	elementBase:	function(element) {
		element.genericFunctions = {
			sendUpdate:	function() {
				var data = this.toData.call(this.genericFunctions);
				//this.sendCmd("updateGenericElement", [this.eid, data]);
				this.sendCmd("updateGenericElement", [this.eid, data]);
			},
			move:	function(x, y) {
				this.factory.log("move arguments: " + JSON.stringify(arguments));
				this.factory.log("move(" + x + ", " + y + ")");
				this.center.x = x;
				this.center.y = y;
				this.factory.log("Going to Update");
				this.sendUpdate();
			},
		};
		//element.sendUpdate = function(){
		//	if(this.eid >= 0)
		//		this.genericFunctions.sendUpdate.call(this)
		//};
		element.factory	= this;
		element.world	= this.world;
		element.sendCmd = function(cmd, data) {this.world.sendCmd(cmd, data)};
		element.center	= new Point();
		element.center.factory = this;
		element.center.world = this.world;
		element.color	= "ff0000";
		element.solid	= true;
		if(element.drawable == null)
			element.drawable = true;
		element.pointToPixel	= function(point) {
			this.world.pointToPixel(point);
		};
		element.sizeToPixel	= function(size) {
			this.world.sizeToPixel(size);
		};
		element.toHash	= function() {
			var new_hash	= {};
			var hash	= this.toData();
			for(key in hash)
				if(hash[key] != "__function__")
					new_hash[key] = hash[key];
			return new_hash;
		},
		element.toData	= function() {
			var hash = {};
			for(key in this)
				if(
					key != "factory"
					&& key != "world"
					&& key != "center"
					&& key != "genericFunctions"
					&& key.substr(0, 1) != "_"
				) {
					if(this[key].constructor != Function) {
						hash[key] = this[key];
					} else {
						hash[key] = "__function__";
					}
					if(hash[key].toHash) hash[key] = hash[key].toHash();
				}
			if(this.path) {
				hash.path = this.path();
			}
			if(this.center) {
				var center = this.center;
				center.center = null;
				if(center.toHash) hash.center = center.toHash();
			}
			return hash;
		};
	},
};

function Point(x, y) {
}

Point.prototype = {
	drawable:	false,
	init:	function(x, y) {
		//this.factory.log("new Point(" + x + ", " + y + ")");
		if(x) this._x = x;
		if(y) this._y = y;
		this.setCardinal(this._x, this._y);
	},
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
		this.factory.log("Point * " + number);
		var tmp = new Point();
		tmp.init(this.x * number, this.y * number);
		this.factory.elementBase(tmp);
		return tmp;
		//return this.factory.createElement("Point", this.x * number, this.y * number);
	},
	translate:	function(point) {
		var tmp = new Point();
		tmp.init(this.x + point.x, this.y + point.y);
		this.factory.elementBase(tmp);
		return tmp;
		//return this.factory.createElement("Point", this.x + point.x, this.y + point.y);
	},
	toPixel:	function() {
		var tmp = this.world.pointToPixelSize(this);
		return tmp;
	},
	toArray:	function() {
		return [this.x, this.y];
	}
};

function CalcRectangle() {
}

CalcRectangle.prototype = {
	UL:	null,
	UR:	null,
	DL:	null,
	DR:	null,
	init:	function(L, R, U, D) {
		this.factory.log("new newCalcRectangle(" + L + ", " + R + ", " + U + ", " + D + ")");
		this.UL = new Point(U, L);
		this.UR = new Point(U, R);
		this.DL = new Point(D, L);
		this.DR = new Point(D, R);
	},
	path:	function(){
		return [
			{moveTo: this.UL.toPixel().toArray()},
			{lineTo: this.UR.toPixel().toArray()},
			{lineTo: this.DR.toPixel().toArray()},
			{lineTo: this.DL.toPixel().toArray()},
			{lineTo: this.UL.toPixel().toArray()},
		];
	},
};

function Arc() { }
Arc.prototype = {
	path:	function(){
		return [ {arc: [0, 0, this.sizeToPixel(this.radius), 0, Math.PI * 2, true]} ];
	},
	radius:		10,
	retangle_definition:	function() {
		var ret = new CalcRectangle();
		ret.UL.x = this.center.x - this.radius;
		ret.UL.y = this.center.y - this.radius;
	
		ret.UR.x = this.center.x + this.radius;
		ret.UR.y = this.center.y - this.radius;
	
		ret.DL.x = this.center.x + this.radius;
		ret.DL.y = this.center.y + this.radius;
	
		ret.DR.x = this.center.x - this.radius;
		ret.DR.y = this.center.y + this.radius;
		return ret;
	},
};
