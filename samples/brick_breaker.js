var Screen = require("..");
var screen                   = new Screen(document.body);
screen.has_gravity(0, 10);
screen.color                 = "#FFFFFF";
screen.width                 = 800;
screen.height                = 500;
screen.dom.style.border      = "solid 1px black";
screen.dom.style.cursor      = "none";

var levels	= screen.createElement("Levels");
levels.x	= screen.width / 2 - 15;
levels.y	= 10;

var lives;
function create_lives() {
	lives	= screen.createElement("Lives", 5);
	lives.x		= screen.width - 60;
	lives.y		= 10;
	lives.on_death = function() {
		alert("You died");
		levels.start();
	};
	lives.on_finish_lives = function() {
		alert("You lose!");
		create_lives();
		levels.restart_level();
	};
}

create_lives();

var quad = screen.createElement("Poligon");
var bola = screen.createElement("Arc");

require("./brick_breaker_blocks/regularBlock.js");

var blocks = {};
[
	"regularBlock"
].forEach(function(block) {
	var conf = require("./brick_breaker_blocks/" + block + ".js");
	blocks[conf.symbol] = conf;
});

levels.starter = function () {
	quad.destroy();
	bola.destroy();
	screen.add(quad);
	screen.add(bola);
	//quad.draw_colision_area      = true;
	quad.solid                   = true;
	//quad.do_not_colide_with      = ["Border"];
	quad.type                    = "Barra";
	quad.color                   = "#000000";
	quad.add_vertice(-25, 0);
	quad.add_vertice(25, 0);
	quad.add_vertice(25, 5);
	quad.add_vertice(-25, 5);
	quad.x                       = screen.width / 2;
	quad.y                       = 450;
	quad.on_colide_with("ball", function(bola) { 
		bola.velocity.ang += (bola.center.x - this.center.x) / 100;
		if(bola.velocity.y > 0) bola.velocity.y *= -1;
		bola.velocity.mod *= 1.005;
	});
	
	bola.type                    = "ball";
	bola.flutuate                = false;
	bola.bounce_when_colide_with = ["Block", "Border"];
	//bola.draw_colision_area           = true;
	bola.solid                   = false;
	bola.radius                  = 5;
	bola.velocity.ang            = (Math.random() - 0.5);
	//bola.velocity.ang            = Math.PI / 3 + Math.PI + Math.random();
	bola.velocity.mod            = +4;
	bola.x                       = screen.width / 2;
	bola.y                       = 440;
	//bola.draw_velocity           = true;
	
	bola.started = false;
	bola.stop();
	quad.on_move = function() {
		if(!bola.started) {
			bola.x = this.center.x;
		}
	};
	
	bola.on_colide_with("block", function(){this.velocity.mod *= 0.99});
	
	document.onclick = function() {
		bola.stopped = false;
		bola.started = true;
	};
};

levels.add_level(function () {
	screen.add(levels);
	screen.add(lives);

	var score	= screen.createElement("Score");
	score.x		= 10;
	score.y		= 10;
	score.set_point_type("block", 1);
	score.set_point_type("ghost", {time: 30000});
	score.set_point_type("powerup", {time: 30000});

	
	
	var coordX = screen.width / 2;
	document.onmousemove = function(e) {
		if(e.clientX - quad.width / 2 > 0 && e.clientX + quad.width / 2 < screen.width)
			coordX = e.clientX;
	};
	document.onkeydown = function(e) {
		var delta = 20;
		if (e.keyCode == 37) {
			coordX = coordX - delta;
		} else if (e.keyCode == 39) {
			coordX = coordX + delta;
		} else if (e.keyCode == 32) {
			bola.stopped = false;
			bola.started = true;
		}
	};
	setInterval(function(){
		quad.velocity.x = (coordX - quad.center.x) * .5;
	}, 10);
	
	//Border.draw_colision_area         = true;
	//Border.color                 = "#AAAAAA";
	
	var borda1                   = screen.createElement("Border");
	borda1.x                     = screen.width - 5;
	
	var borda2                   = screen.createElement("Border");
	borda2.x                     = 5;
	
	var borda3                   = screen.createElement("Border");
	borda3.y                     = 30;
	
	var borda4                   = screen.createElement("Border");
	borda4.y                     = screen.height - 5;
	borda4.on_colide_with("ball", function(bola){ bola.destroy(); lives.died()});
	borda4.on_colide_with("PowerUp", function(powerup){ powerup.destroy(); });
	
	var block_counter = 0;
	
	var going2destroy = function(time) {
		if(this.height <= 3) {
			this.destroy();
		} else {
			this.resize(0.9);
			setTimeout(function(){this.going2destroy(time)}.bind(this), time);
		}
	};
	
	for(var j = 0; j < 3; j++) {
		var w = screen.width;
		var number_of_blocks = 25;
		var block_size       = 25;
		var blocks_space     = 5;
		var r = w - (number_of_blocks * block_size + (number_of_blocks - 1) * blocks_space);
		for(var i = r / 2; i < w - (r / 2); i += block_size + blocks_space) {
			var block_conf = blocks["###"];
			block_counter++;
			var block = screen.createElement(block_conf.type);
			block.randomPowerUp	= randomPowerUp;
			block.on_destroy	= function() {
				block_counter--;
				this.on_colide_with("ball", function(){});
				this.flutuate = false;
				this.going2destroy(150);
				this.velocity = bola.original_velocity.clone();
				this.velocity.mod *= 0.1;
				if(this.block_counter <= 0) {
					setTimeout(function(){
						alert("You Win!");
						this._element_factory.screen.stop = true;
					}.bind(this), 100);
				}
			};
			block.score		= score;
			block.going2destroy	= going2destroy;
			block.x			= i + block_size / 2;
			block.y			= 120 + j * 30;
			block_conf.transformation.call(block);
		}
	}
	
	function randomPowerUp(velocity) {
		var powerUpPercentage = .1; // 10% of change to receive a power up
		if(Math.random() <= powerUpPercentage){
			// TODO: Create a Power Up factory and multiple types of power ups to randomize
			var powerup = screen.createElement("Poligon");
			powerup.visible                 = true;
			powerup.color                   = "#4EA132";
			powerup.draw_colition_area      = false
				powerup.do_not_colide_with      = ["Block"];
			powerup.bounce_when_colide_with = ["Border"];
			powerup.type                    = "PowerUp";
			powerup.x                       = this.x
			powerup.y                       = this.y;
			powerup.flutuate                = false;
			powerup.velocity                = velocity.clone();
			powerup.velocity.mod           *= 0.3;
			powerup.velocity.ang           *= -1;
	
			powerup.add_vertice(0, 0);
			powerup.add_vertice(7, 14);
			powerup.add_vertice(-7, 14);
	
			powerup.on_colide_with("Barra", function() {
				this.destroy();
				score.add("powerup");
			});
		}
	}
	
	var ghost = screen.createElement("Poligon");
	ghost.visible                 = true;
	ghost.color                   = "#888888";
	ghost.draw_colision_area      = false;
	ghost.do_not_colide_with      = ["Border"];
	ghost.type                    = "Block";
	ghost.color                   = "#888888";
	ghost.x                       = screen.width / 2;
	ghost.y                       = 40;
	ghost.add_vertice(-13, 0);
	ghost.add_vertice(12, 0);
	ghost.add_vertice(12, 15);
	ghost.add_vertice(-13, 15);
	
	ghost.going2destroy = going2destroy;
	
	ghost.on_colide_with("ball", function(bola) { 
		clearInterval(this.blink_id);
		score.add("ghost");
		this.do_not_colide_with = ["ball"];
		this.going2destroy();
		if(block_counter <= 0) {
			setTimeout(function(){
				alert("You Win!");
				this._element_factory.screen.stop = true;
			}.bind(this), 100);
		}
	});
	
	ghost.blink_id = setInterval(function(){
		if(ghost.visible) {
			ghost.do_not_colide_with      = ["Border", "ball"];
		} else {
			ghost.do_not_colide_with      = ["Border"];
		}
		ghost.visible = ! ghost.visible;
	}, 5000);
});

levels.next_level();

screen.run();
