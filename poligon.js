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
