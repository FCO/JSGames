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
