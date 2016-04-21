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
