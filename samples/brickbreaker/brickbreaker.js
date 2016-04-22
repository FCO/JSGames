var Screen = require("../..");
require('./blocks/*.js', {mode: 'expand'});
var all_levels	= require("./levels/levels.js");

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


function Blocks(files) {
	this.blocks = {};
	files.forEach(function(block) {
		var conf = require("./blocks/" + block + ".js");
		this.blocks[conf.symbol] = conf;
	}.bind(this));

}
Blocks.prototype = {
	get:	function (symbol) {
		var block_conf, pars = {};
		if(symbol in this.blocks) {
			block_conf = this.blocks[symbol];
		} else {
			block_conf = this.blocks["###"];
			pars.color = "#" + symbol;
		}
		var block = screen.createElement(block_conf.type);
		block_conf.transformation.call(block, pars);
		return block;
	}
};

var blocks = new Blocks(["regular_block"]);

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

levels.add_generic_level(function (level_number) {
	screen.add(levels);
	screen.add(lives);

	var score	= screen.createElement("Score");
	score.x		= 10;
	score.y		= 10;
	score.set_point_type("block", 1);
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
	
	var w = screen.width;
	var number_of_blocks	= 25;
	var space_size		= 5;
	var block_size		= 25;
	var line_heigth		= 30;
	var blocks_space	= 5;
	var initial_i		= 30;
	var initial_j		= 50;
	var j			= initial_j;
	var i			= initial_i;

	var level = all_levels["level" + level_number];
	var array = level.toString().match(/\S{3}|\s/g);
	array.forEach(function(item) {
		if(item == " ") {
			i += space_size;
			return;
		} else if(item == "\n") {
			i = initial_i;
			j += line_heigth;
			return;
		}
		block_counter++;
		block = blocks.get(item);
		block.randomPowerUp	= randomPowerUp;
		block.on_destroy	= function() {
			block_counter--;
			this.on_colide_with("ball", function(){});
			this.flutuate = false;
			this.going2destroy(150);
			this.velocity = bola.original_velocity.clone();
			this.velocity.mod *= 0.1;
			console.log(block_counter + " bricks");
			if(block_counter <= 0) {
				alert("You Win!");
				//this._element_factory.screen.stop = true;
				levels.next_level();
			}
		};
		block.score		= score;
		block.going2destroy	= going2destroy;
		block.x			= i;
		block.y			= j;
		i			+= block_size;
	});
	function randomPowerUp(velocity) {
		var powerUpPercentage = .1; // 10% of change to receive a power up
		if(Math.random() <= powerUpPercentage){
			// TODO: Create a Power Up factory and multiple types of power ups to randomize
			var powerup = screen.createElement("Poligon");
			powerup.visible			= true;
			powerup.color			= "#4EA132";
			powerup.draw_colition_area	= false
			powerup.do_not_colide_with	= ["Block"];
			powerup.bounce_when_colide_with	= ["Border"];
			powerup.type			= "PowerUp";
			powerup.x			= this.x
			powerup.y			= this.y;
			powerup.flutuate		= false;
			powerup.velocity		= velocity.clone();
			powerup.velocity.mod		*= 0.3;
			powerup.velocity.ang		*= -1;
	
			powerup.add_vertice(0, 0);
			powerup.add_vertice(7, 14);
			powerup.add_vertice(-7, 14);
	
			powerup.on_colide_with("Barra", function() {
				this.destroy();
				score.add("powerup");
			});
		}
	}
});

levels.next_level();

screen.run();
