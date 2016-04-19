(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports	= Aceleration;
var Velocity	= require("./velocity.js");

function Aceleration(x, y) {
	this.velocity_per_second = new Velocity(x, y);
}

Aceleration.prototype = {
	velocity_per_second: null,
	get_velocity_alteration_in_ms: function(ms) {
		if(this.velocity_per_second == null) throw "Has no gravity aceleration";
		var clone = this.velocity_per_second.clone();
		clone.multiply(1 / 1 / ms);
		return clone;
	},
	clone: function(){
		var clone = new Aceleration();
		for(var attr in this) {
			if(this[attr].clone != null) clone[attr] = this[attr].clone();
			else clone[attr] = this[attr];
		}
		return clone;
	},
};

},{"./velocity.js":16}],2:[function(require,module,exports){
module.exports	= Arc;
var Retangle	= require("./retangle.js");

function Arc() { }
Arc.prototype = {
	draw: function(screen) {
		screen.ctx.arc(0, 0, this.radius, 0, Math.PI * 2, true);
	},
	retangle_definition: function(){
		var ret = new Retangle();
		ret.Ax = this.x - this.radius;
		ret.Ay = this.y - this.radius;

		ret.Bx = this.x + this.radius;
		ret.By = this.y - this.radius;

		ret.Cx = this.x + this.radius;
		ret.Cy = this.y + this.radius;

		ret.Dx = this.x - this.radius;
		ret.Dy = this.y + this.radius;
		return ret;
	},
	conf: function(hash){},
	color:  "#000000",
	radius: 10,
	x:      0,
	y:      0
};

},{"./retangle.js":12}],3:[function(require,module,exports){
module.exports	= Border;
var Retangle	= require("./retangle.js");

function Border() {
	this.draw_colision_area = Border.draw_colision_area;
	this.draw_velocity = Border.draw_velocity;
}
Border.prototype = {
	do_not_colide_with: ["Border"],
	solid:              false,
	color:              "#000000",
	set x(value) {
		this._x = value;
		this._y = null;
	},
	get x(){
		return this._x;
	},
	set y(value) {
		this._y = value;
		this._x = null;
	},
	get y(){
		return this._y;
	},
	retangle_definition: function() {
		var ret = new Retangle();
		if(this.x) {
			ret.Ax = this.x;
			ret.Bx = this.x;
			ret.Cx = this.x;
			ret.Dx = this.x;

			ret.Ay = 1;
			ret.By = 1;
			ret.Cy = this._element_factory.screen.height;
			ret.Dy = this._element_factory.screen.height;
		} else if(this.y) {
			ret.Ay = this.y;
			ret.By = this.y;
			ret.Cy = this.y;
			ret.Dy = this.y;

			ret.Ax = 1;
			ret.Bx = this._element_factory.screen.width;
			ret.Cx = this._element_factory.screen.width;
			ret.Dx = 1;
		}
		return ret;
	},
	draw: function(screen) {
		if(this.x != null){
			screen.ctx.moveTo(0, 0);  
			screen.ctx.lineTo(0, this._element_factory.screen.height);
		}
		else if(this.y != null) {
			screen.ctx.moveTo(0, 0);  
			screen.ctx.lineTo(this._element_factory.screen.width, 0);
		} else console.log("fudeu!");
	},
};

},{"./retangle.js":12}],4:[function(require,module,exports){
module.exports		= ElementFactory;
require("./lives.js");
require("./score.js");
require("./aceleration.js");
require("./velocity.js");
require("./poligon.js");
require("./retangle.js");
require("./quad.js");
require("./border.js");
require("./arc.js");
require("./levels.js");

var decamelize		= require("decamelize");
var Velocity		= require("./velocity.js");
var Point		= require("./point.js");

function ElementFactory() { }
ElementFactory.prototype = {
	createElement: function(type_class, params) {
		var file = "./" + decamelize(type_class) + ".js";
		var Class = require(file);
		var tmp_obj = new Class(params);
		tmp_obj._class = type_class;
		tmp_obj.clone = function() {
			var clone = this._element_factory.screen.createElement(this._class);
			 for(var attr in this) {
				if(this[attr].clone != null) clone[attr] = this[attr].clone();
				else clone[attr] = this[attr];
			 }
			 return clone;
		};
		tmp_obj.__defineGetter__("height", function(){return this.retangle_definition().height});
		tmp_obj.__defineGetter__("width", function(){return this.retangle_definition().width});
		tmp_obj.stoped = false;
		tmp_obj.stop   = function(){
			this.stopped = true;
		};
		tmp_obj.resume = function(){
			this.stopped = false;
		};
		tmp_obj._element_factory = this;
		tmp_obj._orig_draw = tmp_obj.draw;
		var screen  = tmp_obj.screen = this.screen;
		var element = tmp_obj;
		if(tmp_obj.colision_area == null) tmp_obj.colision_area = tmp_obj.retangle_definition;
		if(tmp_obj._orig_draw != null) {
			tmp_obj.draw = function() {
				this._element_factory.default_before_draw_func(element);
				this._orig_draw(screen);
				this._element_factory.default_after_draw_func(element);
			};
		}
		tmp_obj.__defineGetter__("center", function() {
			return new Point(this.center_x(), this.center_y());
		});
		tmp_obj.bounce = function(element) {
			var eret = element.retangle_definition();
			var _this = this;
			setTimeout(function(){_this.orig_velocity = _this.velocity}, 10);
			if(this.center_x() <= eret.Ax && this.velocity.x > 0)
				this.velocity.x *= -1;
			if(this.center_x() >= eret.Bx && this.velocity.x < 0)
				this.velocity.x *= -1;
			if(this.center_y() <= eret.Ay && this.velocity.y > 0)
				this.velocity.y *= -1;
			if(this.center_y() >= eret.Cy && this.velocity.y < 0)
				this.velocity.y *= -1;
			this.velocity.ang += (Math.random() - 0.5) / 10;
		},
		tmp_obj.destroy = function() {
			if(this.before_destroy != null) this.before_destroy();
			this._element_factory.screen.removeElement(this);
		},
		tmp_obj.center_x = function() {
			var ret = this.retangle_definition();
			return(ret.Ax + ((ret.Bx - ret.Ax) / 2))
		};
		tmp_obj.center_y = function() {
			var ret = this.retangle_definition();
			return(ret.Ay + ((ret.Cy - ret.Ay) / 2))
		};
		tmp_obj.velocity = new Velocity();
		tmp_obj.velocity.element = tmp_obj;
		if(tmp_obj.solid == null) tmp_obj.solid = true;
		tmp_obj.move = function() {
			if(this.stopped) return;
			if((this.velocity.x == null || this.velocity.x == 0)
					&& (this.velocity.y == null || this.velocity.y == 0))
				return;
			if(this.flutuate != null && !this.flutuate && this._element_factory.screen.gravity != null) {
				//if(this.type != "ball") console.log("usando gravidade!");
				var current_time = (new Date()).getTime();
				if(this.last_fall == null) this.last_fall = current_time;
				var passed = current_time - this.last_fall;
				if(passed < 1) return;
				if(passed >= 100) {
					var to_add = this._element_factory.screen.gravity.get_velocity_alteration_in_ms(passed);
					this.velocity.add(to_add);
					this.last_fall = current_time;
				}
			}
			//this.velocity.dump();
			this.x += this.velocity.x;
			this.y += this.velocity.y;
			if(tmp_obj.on_move != null) tmp_obj.on_move();
		};
		tmp_obj.elementsColiding = function(element) {
		};
		tmp_obj.on_colide_with = function(type, sub) {
			if(this.types_to_colide == null) this.types_to_colide = {};
			this.types_to_colide[type] = sub;
		};
		tmp_obj.on_colide_with_multiple = function(type, sub) {
			if(this.types_to_multiple_colide == null) this.types_to_multiple_colide = {};
			this.types_to_multiple_colide[type] = sub;
		};
		tmp_obj.can_colide_with = function(element, reverse) {
			if(reverse == null) {
				if(!element.can_colide_with(this, false))return false;
			}
			if(this.do_not_colide_with != null) {
				var cant = this.do_not_colide_with;
				 for(var i = 0; i < cant.length; i++) {
					if(element.type == cant[i]) return false;
				 }
			}
			return true;
		};
		return tmp_obj;
	},
	default_before_draw_func: function(element) {
		var screen = this.screen;
		screen.ctx.save();
		screen.ctx.translate(element.x,element.y);
		if(element.solid && element.color != null) screen.ctx.fillStyle = element.color;
		else if(element.color != null) screen.ctx.strokeStyle = element.color;
		screen.ctx.beginPath();
	},
	default_after_draw_func: function(element) {
		var screen = this.screen;
		if(element.solid) screen.ctx.fill();
		else screen.ctx.stroke();
		screen.ctx.restore();
		if(element.draw_center_point) {
		        this.default_before_draw_func(element.center);
		        element.center.draw(screen);
		        this.default_after_draw_func(element.center);
		}
		if(element.draw_colision_area) {
		        this.default_before_draw_func(element.retangle_definition());
		        element.retangle_definition().draw(screen);
		        this.default_after_draw_func(element.retangle_definition());
		}
		if(element.draw_velocity) {
		        this.default_before_draw_func(element.velocity);
		        element.velocity.draw(screen);
		        this.default_after_draw_func(element.velocity);
		}
	 },
	//draw_retangle: false,
};

},{"./aceleration.js":1,"./arc.js":2,"./border.js":3,"./levels.js":6,"./lives.js":7,"./point.js":9,"./poligon.js":10,"./quad.js":11,"./retangle.js":12,"./score.js":14,"./velocity.js":16,"decamelize":8}],5:[function(require,module,exports){

var Screen		= require("./screen.js");

module.exports = Screen;




},{"./screen.js":15}],6:[function(require,module,exports){
module.exports = Levels;

function Levels() {
	this.levels = [];
}

Levels.prototype = {
	title:			"Level",
	separator:		": ",
	levels:			null,
	generic:		function(){},
	current_level:		-1,
	starter:		function(){},

	add_level:		function(level) {
		this.levels.push(level);
	},
	add_starter:		function(starter) {
		this.starter = starter;
	},
	add_generic_level:	function(level) {
		this.generic = level;
	},
	start:			function() {
		this.starter(this.current_level);
	},
	run_level:		function(index) {
		this.clean_level();
		this.current_level = index;
		if(this.levels[index] == null) {
			this.generic(index);
		} else {
			this.levels[index](index);
		}
		this.start();
	},
	next_level:		function() {
		this.run_level(this.current_level + 1);
	},
	restart_level:		function() {
		this.run_level(this.current_level);
	},
	clean_level:		function() {
		this.screen.clear();
	},
	retangle_definition:	function(){},
	draw:			function(screen) {
		screen.ctx.fillText(this.title + this.separator + this.current_level, 0, 0);
	}
};

},{}],7:[function(require,module,exports){
module.exports = Lives;

function Lives(lives) {
	if(lives != null)
		this.lives = lives;
}

Lives.prototype = {
	lives:			1,
	solid:			false,
	x:			0,
	y:			0,
	color:			"#000000",
	title:			"Lives",
	separator:		": ",
	on_death:		function(){},
	on_finish_lives:	function(){},

	died:	function() {
		this.lives -= 1;
		this.on_death();
		if(this.lives <= 0)
			this.on_finish_lives();
	},
	newLives:	function(lives) {
		this.lives += lives == undefined ? 1 : lives;
	},
	retangle_definition: function(){},
	draw: function(screen) {
		screen.ctx.fillText(this.title + this.separator + this.lives, 0, 0);
	}
};

},{}],8:[function(require,module,exports){
'use strict';
module.exports = function (str, sep) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	sep = typeof sep === 'undefined' ? '_' : sep;

	return str
		.replace(/([a-z\d])([A-Z])/g, '$1' + sep + '$2')
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + sep + '$2')
		.toLowerCase();
};

},{}],9:[function(require,module,exports){
module.exports = Point;

function Point(x, y) {
	if(x != null) this.x = x;
	if(y != null) this.y = y;
}
Point.prototype = {
	x:     0,
	y:     0,
	color: "#FF0000",
	solid: true,
	get vector() {
		return new Velocity(this.x, this.y);
	},
	clone: function(){
		var clone = new Point();
		for(var attr in this) {
			if(this[attr].clone != null) clone[attr] = this[attr].clone();
			else clone[attr] = this[attr];
		}
		return clone;
	},
	draw: function() {
		screen.ctx.arc(0, 0, 2, 0, Math.PI * 2, true);
	},
};

},{}],10:[function(require,module,exports){
module.exports	= Poligon;
var Retangle	= require("./retangle.js");
var Point	= require("./point.js");

function Poligon() {
	this.points = [];
}
Poligon.prototype = {
	set x(value) {
		this.changed = true;
		this._x = value;
	},
	get x() {return this._x},
	set y(value) {
		this.changed = true;
		this._y = value;
	},
	get y() {return this._y},
	angle: 0,
	//points: [],
	resize: function(val) {
		for(var i = 0; i < this.points.length; i++) {
			this.points[i].x *= val;
			this.points[i].y *= val;
		}
	},
	rotate: function(ang) {
		this.changed = true;
		this.angle += ang;
		for(var i = 0; i < this.points.length; i++) {
			var tmp_vector = this.points[i].vector;
			tmp_vector.ang += ang;
			this.points[i] = tmp_vector.point;
		}
	},
	add_vertice: function(x, y) {
		this.changed = true;
		var tmp_p = new Point(x, y);
		this.points.push(tmp_p);
	},
	retangle_definition: function() {
		if(! this.changed) return this.last_return;
		var ret = new Retangle();
		var min_x = this._element_factory.screen.width;
		var max_x = 0;
		var min_y = this._element_factory.screen.height;
		var max_y = 0;
		for(var i = 0; i < this.points.length; i++) {
			if(this.points[i].x > max_x) max_x = this.points[i].x;
			if(this.points[i].x < min_x) min_x = this.points[i].x;
			if(this.points[i].y > max_y) max_y = this.points[i].y;
			if(this.points[i].y < min_y) min_y = this.points[i].y;
		}

		ret.Ax = this.x + min_x;
		ret.Ay = this.y + min_y;
		ret.Bx = this.x + max_x;
		ret.By = this.y + min_y;
		ret.Cx = this.x + max_x;
		ret.Cy = this.y + max_y;
		ret.Dx = this.x + min_x;
		ret.Dy = this.y + max_y;

		this.last_return = ret;
		this.changed = false;

		return ret;
	},
	draw: function(screen) {
		screen.ctx.moveTo(this.points[0].x, this.points[0].y);
		for(var i = 1; i < this.points.length; i++) {
			screen.ctx.lineTo(this.points[i].x, this.points[i].y);
		}
		if(!this.solid){
			screen.ctx.lineTo(this.points[0].x, this.points[0].y);
		}
	}
};

},{"./point.js":9,"./retangle.js":12}],11:[function(require,module,exports){
module.exports = Quad;

function Quad() { }
Quad.prototype = {
	solid:        false,
	color:        "#000000",
	Ax:           0,
	Ay:           0,
	Bx:           0,
	By:           0,
	Cx:           0,
	Cy:           0,
	Dx:           0,
	Dy:           0,
	_x:           0,
	_y:           0,
	_width:       0,
	_height:      0,
	get x(){
		return this._x;
	},
	set x(value) {
		this._x = value;
		this.Ax = value;
		this.Bx = value + this.width;
		this.Cx = value + this.width;
		this.Dx = value;
	},
	get y(){
		return this._y;
	},
	set y(value) {
		this._y = value;
		this.Ay = value;
		this.By = value;
		this.Cy = value + this.height;
		this.Dy = value + this.height;
	},
	get width(){
		return this._width;
	},
	set width(value) {
		this._width = value;
		this.Bx = value + this.x;
		this.Cx = value + this.x;
	},
	get height(){
		return this._height;
	},
	set height(value) {
		this._height = value;
		this.Cy = value + this.y;
		this.Dy = value + this.y;
	},
	retangle_definition: function() {
		var ret = new Retangle();
		ret.Ax = this.Ax;
		ret.Bx = this.Bx;
		ret.Cx = this.Cx;
		ret.Dx = this.Dx;

		ret.Ay = this.Ay;
		ret.By = this.By;
		ret.Cy = this.Cy;
		ret.Dy = this.Dy;
		return ret;
	},
	clone: function() {
		var clone = new Retangle();
		for(var attr in this) {
			if(this[attr].clone != null) clone[attr] = this[attr].clone();
			else clone[attr] = this[attr];
		}
		return clone;
	},
	draw: function(screen) {
		screen.ctx.moveTo(0, 0);  
		screen.ctx.lineTo(this.width, 0);
		//screen.ctx.moveTo(this.width, 0);
		screen.ctx.lineTo(this.width, this.height);
		//screen.ctx.moveTo(this.width, this.height);
		screen.ctx.lineTo(0, this.height);
		//screen.ctx.moveTo(0, this.height);
		screen.ctx.lineTo(0, 0);
	},
};

},{}],12:[function(require,module,exports){
module.exports = Retangle;
function Retangle(){ }

Retangle.prototype = {
	Ax:            null,
	Bx:            null,
	Cx:            null,
	Dx:            null,
	Ay:            null,
	By:            null,
	Cy:            null,
	Dy:            null,
	solid:         false,
	color:         "#FF0000",
	//draw_retangle: false,
	get width() {
		return this.Bx - this.Ax
	},
	get height() {
		return this.Dy - this.Ay
	},
	draw: function(screen) {
		screen.ctx.moveTo(this.Ax, this.Ay);  
		screen.ctx.lineTo(this.Bx, this.By);
		screen.ctx.moveTo(this.Bx, this.By);
		screen.ctx.lineTo(this.Cx, this.Cy);
		screen.ctx.moveTo(this.Cx, this.Cy);
		screen.ctx.lineTo(this.Dx, this.Dy);
		screen.ctx.moveTo(this.Dx, this.Dy);
		screen.ctx.lineTo(this.Ax, this.Ay);
	},
};

},{}],13:[function(require,module,exports){
var Screen = require("..");
var screen                   = new Screen(document.body);
screen.has_gravity(0, 10);
screen.color                 = "#FFFFFF";
screen.width                 = 800;
screen.height                = 500;
screen.dom.style.border      = "solid 1px black";
screen.dom.style.cursor      = "none";

var levels	= screen.createElement("Levels");
levels.x	= screen.width / 2 - 15;
levels.y	= 10;

var lives;
function create_lives() {
	lives	= screen.createElement("Lives", 5);
	lives.x		= screen.width - 60;
	lives.y		= 10;
	lives.on_death = function() {
		alert("You died");
		levels.start();
	};
	lives.on_finish_lives = function() {
		alert("You lose!");
		create_lives();
		levels.restart_level();
	};
}

create_lives();

var quad = screen.createElement("Poligon");
var bola = screen.createElement("Arc");

levels.starter = function () {
	quad.destroy();
	bola.destroy();
	screen.add(quad);
	screen.add(bola);
	//quad.draw_colision_area      = true;
	quad.solid                   = true;
	//quad.do_not_colide_with      = ["Border"];
	quad.type                    = "Barra";
	quad.color                   = "#000000";
	quad.add_vertice(-25, 0);
	quad.add_vertice(25, 0);
	quad.add_vertice(25, 5);
	quad.add_vertice(-25, 5);
	quad.x                       = screen.width / 2;
	quad.y                       = 450;
	quad.on_colide_with("ball", function(bola) { 
		bola.velocity.ang += (bola.center.x - this.center.x) / 100;
		if(bola.velocity.y > 0) bola.velocity.y *= -1;
		bola.velocity.mod *= 1.005;
	});
	
	bola.type                    = "ball";
	bola.flutuate                = false;
	bola.bounce_when_colide_with = ["Block", "Border"];
	//bola.draw_colision_area           = true;
	bola.solid                   = false;
	bola.radius                  = 5;
	bola.velocity.ang            = (Math.random() - 0.5);
	//bola.velocity.ang            = Math.PI / 3 + Math.PI + Math.random();
	bola.velocity.mod            = +4;
	bola.x                       = screen.width / 2;
	bola.y                       = 440;
	//bola.draw_velocity           = true;
	
	bola.started = false;
	bola.stop();
	quad.on_move = function() {
		if(!bola.started) {
			bola.x = this.center.x;
		}
	};
	
	bola.on_colide_with("block", function(){this.velocity.mod *= 0.99});
	
	document.onclick = function() {
		bola.stopped = false;
		bola.started = true;
	};
};

levels.add_level(function () {
	screen.add(levels);
	screen.add(lives);

	var score	= screen.createElement("Score");
	score.x		= 10;
	score.y		= 10;
	score.set_point_type("block", 1);
	score.set_point_type("ghost", {time: 30000});
	score.set_point_type("powerup", {time: 30000});

	
	
	var coordX = screen.width / 2;
	document.onmousemove = function(e) {
		if(e.clientX - quad.width / 2 > 0 && e.clientX + quad.width / 2 < screen.width)
			coordX = e.clientX;
	};
	document.onkeydown = function(e) {
		var delta = 20;
		if (e.keyCode == 37) {
			coordX = coordX - delta;
		} else if (e.keyCode == 39) {
			coordX = coordX + delta;
		} else if (e.keyCode == 32) {
			bola.stopped = false;
			bola.started = true;
		}
	};
	setInterval(function(){
		quad.velocity.x = (coordX - quad.center.x) * .5;
	}, 10);
	
	//Border.draw_colision_area         = true;
	//Border.color                 = "#AAAAAA";
	
	var borda1                   = screen.createElement("Border");
	borda1.x                     = screen.width - 5;
	
	var borda2                   = screen.createElement("Border");
	borda2.x                     = 5;
	
	var borda3                   = screen.createElement("Border");
	borda3.y                     = 30;
	
	var borda4                   = screen.createElement("Border");
	borda4.y                     = screen.height - 5;
	borda4.on_colide_with("ball", function(bola){ bola.destroy(); lives.died()});
	borda4.on_colide_with("PowerUp", function(powerup){ powerup.destroy(); });
	
	var block_counter = 0;
	
	var going2destroy = function(time) {
		if(this.height <= 3) {
			this.destroy();
		} else {
			this.resize(0.9);
			setTimeout(function(){this.going2destroy(time)}.bind(this), time);
		}
	};
	
	for(var j = 0; j < 3; j++) {
		var w = screen.width;
		var number_of_blocks = 25;
		var block_size       = 25;
		var blocks_space     = 5;
		var r = w - (number_of_blocks * block_size + (number_of_blocks - 1) * blocks_space);
		for(var i = r / 2; i < w - (r / 2); i += block_size + blocks_space) {
			var block                     = screen.createElement("Poligon");
			block_counter++;
			block.draw_colision_area      = false;
			block.solid                   = true;
			block.do_not_colide_with      = ["Border"];
			block.type                    = "Block";
			block.color                   = "#000000";
			block.x                       = i + block_size / 2;
			block.y                       = 120 + j * 30;
			block.add_vertice(-13, 0);
			block.add_vertice(12, 0);
			block.add_vertice(12, 15);
			block.add_vertice(-13, 15);
			block.going2destroy = going2destroy;
			block.on_colide_with("ball", function(bola) { 
				score.add("block");
				block_counter--;
				//this.do_not_colide_with = ["ball"];
				this.on_colide_with("ball", function(){});
				this.flutuate = false;
				this.going2destroy(150);
				this.velocity = bola.original_velocity.clone();
				this.velocity.mod *= 0.1;
				if(block_counter <= 0) {
					setTimeout(function(){
						alert("You Win!");
						this._element_factory.screen.stop = true;
					}.bind(this), 100);
				} else {
					randomPowerUp(this, bola.velocity);
				}
			});
		}
	}
	
	var randomPowerUp = function (sourceBlock, velocity) {
		var powerUpPercentage = .1; // 10% of change to receive a power up
		if(Math.random() <= powerUpPercentage){
			// TODO: Create a Power Up factory and multiple types of power ups to randomize
			var powerup = screen.createElement("Poligon");
			powerup.visible                 = true;
			powerup.color                   = "#4EA132";
			powerup.draw_colition_area      = false
				powerup.do_not_colide_with      = ["Block"];
			powerup.bounce_when_colide_with = ["Border"];
			powerup.type                    = "PowerUp";
			powerup.x                       = sourceBlock.x
				powerup.y                       = sourceBlock.y;
			powerup.flutuate                = false;
			powerup.velocity                = velocity.clone();
			powerup.velocity.mod           *= 0.3;
			powerup.velocity.ang           *= -1;
	
			powerup.add_vertice(0, 0);
			powerup.add_vertice(7, 14);
			powerup.add_vertice(-7, 14);
	
			powerup.on_colide_with("Barra", function() {
				this.destroy();
				score.add("powerup");
			});
		}
	}
	
	var ghost = screen.createElement("Poligon");
	ghost.visible                 = true;
	ghost.color                   = "#888888";
	ghost.draw_colision_area      = false;
	ghost.do_not_colide_with      = ["Border"];
	ghost.type                    = "Block";
	ghost.color                   = "#888888";
	ghost.x                       = screen.width / 2;
	ghost.y                       = 40;
	ghost.add_vertice(-13, 0);
	ghost.add_vertice(12, 0);
	ghost.add_vertice(12, 15);
	ghost.add_vertice(-13, 15);
	
	ghost.going2destroy = going2destroy;
	
	ghost.on_colide_with("ball", function(bola) { 
		clearInterval(this.blink_id);
		score.add("ghost");
		this.do_not_colide_with = ["ball"];
		this.going2destroy();
		if(block_counter <= 0) {
			setTimeout(function(){
				alert("You Win!");
				this._element_factory.screen.stop = true;
			}.bind(this), 100);
		}
	});
	
	ghost.blink_id = setInterval(function(){
		if(ghost.visible) {
			ghost.do_not_colide_with      = ["Border", "ball"];
		} else {
			ghost.do_not_colide_with      = ["Border"];
		}
		ghost.visible = ! ghost.visible;
	}, 5000);
});

levels.next_level();

screen.run();

},{"..":5}],14:[function(require,module,exports){
module.exports = Score;

function Score(){
	this.multiplicator = new ScoreMultiplicator(this);
}

Score.prototype = {
	points:         0,
	solid:          false,
	x:              0,
	y:              0,
	color:          "#000000",
	title:          "Score",
	separator:      ": ",
	points_by_type: {},
	set_point_type: function(type, points) {
		this.points_by_type[type] = points;
	},
	add: function(type) {
		if(this.points_by_type[type] == null) return;
		if(typeof(this.points_by_type[type]) == "object") {
		        this.multiplicator.add_for(this.points_by_type[type].time);
		} else { 
			this.points += this.multiplicator.calculate(this.points_by_type[type]);
		}
	},
	retangle_definition: function(){},
	draw: function(screen) {
		screen.ctx.fillText(this.title + this.separator + this.points + this.multiplicator.string, 0, 0);
	}
};

function ScoreMultiplicator(score) {
	this.score = score;
}

ScoreMultiplicator.prototype = {
	value:         1,
	time:          0,
	default_value: 1,
	separator:     "  |  ",
	simbol:        "x",
	get string() {
		if(this.value <= 1) return "";
		return this.separator + this.value + this.simbol;
	},
	calculate: function(val) {
		if(this.time < (new Date()).getTime()) {
			this.value = this.default_value;
		}
		return val * this.value;
	},
	add_for: function(time) {
		this.value++;
		this.time	 = (new Date()).getTime() + time;
	},
};

},{}],15:[function(require,module,exports){
module.exports		= Screen;
var ElementFactory	= require("./element_factory.js");
var Aceleration		= require("./aceleration.js");

function Screen(container) {
	this.container      = container;
	this.dom            = document.createElement("canvas");
	this.ctx            = this.dom.getContext('2d');
	this.eleFact        = new ElementFactory();
	this.eleFact.screen = this;
	container.appendChild(this.dom);
}

Screen.prototype = {
	elements: [],
	color: "#AAAAAA",
	set width(size){
		this.dom.width = size;
	},
	get width(){
		return this.dom.width;
	},
	set height(size){
		this.dom.height = size;
	},
	get height(){
		return this.dom.height;
	},
	has_gravity:	function(gravity_x, gravity_y) {
		this.gravity = new Aceleration(gravity_x, gravity_y);
	},
	add:		function(element) {
		this.elements.push(element);
	},
	createElement:	function(elementType, hashParams) {
		var tmp_ele = this.eleFact.createElement(elementType, hashParams);
		tmp_ele.type = elementType;
		this.add(tmp_ele);
		return tmp_ele;
	},
	run: function() {
		var _this = this;
		this.interval_id = setInterval(function(){_this.run_cycle()}, 20);
	},
	are_elements_coliding: function(ele1, ele2) {
		var ret1 = ele1.retangle_definition();
		var ret2 = ele2.retangle_definition();

		//var count = 0;
		if(ret1 == null || ret2 == null) return false;

		if(ret1.Bx < ret2.Ax) return false;
		else if(ret2.Bx < ret1.Ax) return false;
		else if(ret1.Cy < ret2.Ay) return false;
		else if(ret2.Cy < ret1.Ay) return false;
		else return true;
	},
	draw: function() {
		var screen = this;
		this.ctx.save();
		if(this.color != null) this.ctx.fillStyle = this.color;
		this.ctx.fillStyle = "white";
		this.ctx.fillRect(0, 0, this.width, this.height);
		this.ctx.restore();
		for(var i = 0; i < this.elements.length; i++) {
			if(this.elements[i].move != null) this.elements[i].move();
			if(this.elements[i].changeMovement != null) this.elements[i].changeMovement();
			if(this.elements[i].draw != null && (this.elements[i].visible == null || this.elements[i].visible)) this.elements[i].draw();
		}
	},
	who_are_coliding: function() {
		var celements = [];
		for(var i = 0; i < this.elements.length; i++) {
			if(this.elements[i].elementsColiding != null) {
				for(var j = i + 1; j < this.elements.length; j++) {
					if(this.are_elements_coliding(this.elements[i], this.elements[j])) {
						if(this.elements[i].can_colide_with(this.elements[j])) {

							if(this.elements[i].colides == null) this.elements[i].colides = {};
							if(this.elements[j].colides == null) this.elements[j].colides = {};

							var itype = this.elements[i].type;
							var jtype = this.elements[j].type;

							if(this.elements[i].colides[jtype] == null) this.elements[i].colides[jtype] = [];
							if(this.elements[j].colides[itype] == null) this.elements[j].colides[itype] = [];

							this.elements[i].colides[jtype].push(this.elements[j]);
							this.elements[j].colides[itype].push(this.elements[i]);

							celements.push(this.elements[i]);
							celements.push(this.elements[j]);
						}
					}
				}
			}
		}
		return celements;
	},
	run_cycle: function() {
		if(this.stop) {
			clearInterval(this.interval_id);
			return false;
		}
		this.draw();
		var coliding = this.who_are_coliding();
		for(var i = 0; i < coliding.length; i++) {
			coliding[i].original_velocity = coliding[i].velocity.clone();
			var tmp_hash = coliding[i].colides;
			coliding[i].colides = null;
			for(var type in tmp_hash) {
				if(coliding[i].types_to_multiple_colide != null && coliding[i].types_to_multiple_colide[type] != null) {
					coliding[i].types_to_multiple_colide[type](tmp_hash[type]);
				}
				if(coliding[i].types_to_colide != null && coliding[i].types_to_colide[type] != null) {
					for(var j = 0; j < tmp_hash[type].length; j++) {
						coliding[i]._tmp_func = coliding[i].types_to_colide[type];
						coliding[i]._tmp_func(tmp_hash[type][j]);
					}
				}
				if(coliding[i].on_colide != null) coliding[i].on_colide(tmp_hash[type][0]);
				if(coliding[i].bounce_when_colide_with != null){
					for(var ct_index = 0; ct_index < coliding[i].bounce_when_colide_with.length; ct_index++){
						if(coliding[i].bounce_when_colide_with[ct_index] == type) {
							for(var k = 0; k < tmp_hash[type].length; k++) {
								coliding[i].bounce(tmp_hash[type][k]);
							}
						}
					}
				}
			}
		}
	},
	removeElement: function(element) {
		for(var i = 0; i < this.elements.length; i++) {
			if(this.elements[i] === element) this.elements.splice(i, 1);
		}
	},
	clear: function(element) {
		this.elements = [];
	},
};

},{"./aceleration.js":1,"./element_factory.js":4}],16:[function(require,module,exports){
module.exports = Velocity;

function Velocity(x, y) {
	if(x != null) this.x = x; else this.x = 0;
	if(y != null) this.y = y; else this.y = 0;
}

Velocity.prototype = {
	_x:    0,
	_y:    0,
	_ang:  null,
	_mod:  null,
	color: "#FF0000",
	set x(value) {
		this._x = value;
		this.set_cart(this.x, this.y);
	},
	get x(){return this._x},
	set y(value) {
		this._y = value;
		this.set_cart(this.x, this.y);
	},
	get y(){return this._y},

	set ang(value){
		this._ang = value;
		this.set_vector(this.ang, this.mod);
	},
	get ang(){return this._ang},

	set mod(value){
		this._mod = value;
		this.set_vector(this.ang, this.mod);
	},
	get mod(){return this._mod},

	get point() {
		return new Point(this.x, this.y);
	},

	set_cart: function(x, y) {
		this._mod = Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 1 / 2)
		this._ang = Math.atan2(x, y);
	},
	set_vector: function(ang, mod) {
		this._x = Math.sin(ang) * mod;
		this._y = Math.cos(ang) * mod;
	},
	draw: function(screen) {
		screen.ctx.moveTo(this.element.center_x(), this.element.center_y());  
		screen.ctx.lineTo(this.element.center_x() + (this.x * 20), this.element.center_y() + (this.y * 20));
	},
	add: function(vel) {
		//this.dump();
		//vel.dump();
		this.x += vel.x;
		this.y += vel.y;
		//this.dump();
	},
	multiply: function(value) {
		this.x *= value;
		this.y *= value;
	},
	clone: function(){
		var clone = new Velocity();
		clone.x = this.x;
		clone.y = this.y;
		return clone;
	},
	dump: function() {
		if(console.log == null) return;
		console.log("x: " + this.x);
		console.log("y: " + this.y);
	},
};

},{}]},{},[13]);
