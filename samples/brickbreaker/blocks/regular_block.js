exports.symbol		= "###";
exports.type		= "Poligon";
exports.transformation	= function(data) {
	var color = "#000000";
	if(data && data.color) color = data.color;
	this.draw_colision_area      = false;
	this.solid                   = true;
	this.do_not_colide_with      = ["Border"];
	this.type                    = "Block";
	this.color                   = color;
	this.add_vertice(-13, 0);
	this.add_vertice(12, 0);
	this.add_vertice(12, 15);
	this.add_vertice(-13, 15);
	this.on_colide_with("ball", function(bola) {
		this.score.add("block");
		this.on_destroy();
		this.randomPowerUp(bola.velocity);
	});
};
