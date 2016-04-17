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
