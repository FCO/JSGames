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
