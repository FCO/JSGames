module.exports		= Screen;
var ElementFactory	= require("./element_factory.js");
var Aceleration		= require("./aceleration.js");

function Screen(container) {
	this.container      = container;
	this.dom            = document.createElement("canvas");
	this.ctx            = this.dom.getContext('2d');
	this.eleFact        = new ElementFactory();
	this.eleFact.screen = this;
	container.appendChild(this.dom);
}

Screen.prototype = {
	elements: [],
	color: "#AAAAAA",
	set width(size){
		this.dom.width = size;
	},
	get width(){
		return this.dom.width;
	},
	set height(size){
		this.dom.height = size;
	},
	get height(){
		return this.dom.height;
	},
	has_gravity:	function(gravity_x, gravity_y) {
		this.gravity = new Aceleration(gravity_x, gravity_y);
	},
	add:		function(element) {
		this.elements.push(element);
	},
	createElement:	function(elementType, hashParams) {
		var tmp_ele = this.eleFact.createElement(elementType, hashParams);
		tmp_ele.type = elementType;
		this.add(tmp_ele);
		return tmp_ele;
	},
	run: function() {
		var _this = this;
		this.interval_id = setInterval(function(){_this.run_cycle()}, 20);
	},
	are_elements_coliding: function(ele1, ele2) {
		var ret1 = ele1.retangle_definition();
		var ret2 = ele2.retangle_definition();

		//var count = 0;
		if(ret1 == null || ret2 == null) return false;

		if(ret1.Bx < ret2.Ax) return false;
		else if(ret2.Bx < ret1.Ax) return false;
		else if(ret1.Cy < ret2.Ay) return false;
		else if(ret2.Cy < ret1.Ay) return false;
		else return true;
	},
	draw: function() {
		var screen = this;
		this.ctx.save();
		if(this.color != null) this.ctx.fillStyle = this.color;
		this.ctx.fillStyle = "white";
		this.ctx.fillRect(0, 0, this.width, this.height);
		this.ctx.restore();
		for(var i = 0; i < this.elements.length; i++) {
			if(this.elements[i].move != null) this.elements[i].move();
			if(this.elements[i].changeMovement != null) this.elements[i].changeMovement();
			if(this.elements[i].draw != null && (this.elements[i].visible == null || this.elements[i].visible)) this.elements[i].draw();
		}
	},
	who_are_coliding: function() {
		var celements = [];
		for(var i = 0; i < this.elements.length; i++) {
			if(this.elements[i].elementsColiding != null) {
				for(var j = i + 1; j < this.elements.length; j++) {
					if(this.are_elements_coliding(this.elements[i], this.elements[j])) {
						if(this.elements[i].can_colide_with(this.elements[j])) {

							if(this.elements[i].colides == null) this.elements[i].colides = {};
							if(this.elements[j].colides == null) this.elements[j].colides = {};

							var itype = this.elements[i].type;
							var jtype = this.elements[j].type;

							if(this.elements[i].colides[jtype] == null) this.elements[i].colides[jtype] = [];
							if(this.elements[j].colides[itype] == null) this.elements[j].colides[itype] = [];

							this.elements[i].colides[jtype].push(this.elements[j]);
							this.elements[j].colides[itype].push(this.elements[i]);

							celements.push(this.elements[i]);
							celements.push(this.elements[j]);
						}
					}
				}
			}
		}
		return celements;
	},
	run_cycle: function() {
		if(this.stop) {
			clearInterval(this.interval_id);
			return false;
		}
		this.draw();
		var coliding = this.who_are_coliding();
		for(var i = 0; i < coliding.length; i++) {
			coliding[i].original_velocity = coliding[i].velocity.clone();
			var tmp_hash = coliding[i].colides;
			coliding[i].colides = null;
			for(var type in tmp_hash) {
				if(coliding[i].types_to_multiple_colide != null && coliding[i].types_to_multiple_colide[type] != null) {
					coliding[i].types_to_multiple_colide[type](tmp_hash[type]);
				}
				if(coliding[i].types_to_colide != null && coliding[i].types_to_colide[type] != null) {
					for(var j = 0; j < tmp_hash[type].length; j++) {
						coliding[i]._tmp_func = coliding[i].types_to_colide[type];
						coliding[i]._tmp_func(tmp_hash[type][j]);
					}
				}
				if(coliding[i].on_colide != null) coliding[i].on_colide(tmp_hash[type][0]);
				if(coliding[i].bounce_when_colide_with != null){
					for(var ct_index = 0; ct_index < coliding[i].bounce_when_colide_with.length; ct_index++){
						if(coliding[i].bounce_when_colide_with[ct_index] == type) {
							for(var k = 0; k < tmp_hash[type].length; k++) {
								coliding[i].bounce(tmp_hash[type][k]);
							}
						}
					}
				}
			}
		}
	},
	removeElement: function(element) {
		for(var i = 0; i < this.elements.length; i++) {
			if(this.elements[i] === element) this.elements.splice(i, 1);
		}
	},
	clear: function(element) {
		this.elements = [];
	},
};
