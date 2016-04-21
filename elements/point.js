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
