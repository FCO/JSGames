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
