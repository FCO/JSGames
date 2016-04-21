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
