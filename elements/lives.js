module.exports = Lives;

function Lives(lives) {
	if(lives != null)
		this.lives = lives;
}

Lives.prototype = {
	lives:			1,
	solid:			false,
	x:			0,
	y:			0,
	color:			"#000000",
	title:			"Lives",
	separator:		": ",
	on_death:		function(){},
	on_finish_lives:	function(){},

	died:	function() {
		this.lives -= 1;
		this.on_death();
		if(this.lives <= 0)
			this.on_finish_lives();
	},
	newLives:	function(lives) {
		this.lives += lives == undefined ? 1 : lives;
	},
	retangle_definition: function(){},
	draw: function(screen) {
		screen.ctx.fillText(this.title + this.separator + this.lives, 0, 0);
	}
};
