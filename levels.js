module.exports = Levels;

function Levels() {
	this.levels = [];
}

Levels.prototype = {
	title:			"Level",
	separator:		": ",
	levels:			null,
	generic:		function(){},
	current_level:		-1,

	add_level:		function(level) {
		this.levels.push(level);
	},
	add_generic_level:	function(level) {
		this.generic = level;
	},
	run_level:		function(index) {
		this.clean_level();
		this.current_level = index;
		if(this.levels[index] == null) {
			this.generic(index);
		} else {
			this.levels[index](index);
		}
	},
	next_level:		function() {
		this.run_level(this.current_level + 1);
	},
	restart_level:		function() {
		this.run_level(this.current_level);
	},
	clean_level:		function() {
		this.screen.clear();
	},
	retangle_definition:	function(){},
	draw:			function(screen) {
		screen.ctx.fillText(this.title + this.separator + this.current_level, 0, 0);
	}
};
