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
