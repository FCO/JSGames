module.exports		= ElementFactory;
require('./elements/*.js', {mode: 'expand'});

var decamelize		= require("decamelize");
var Velocity		= require("./elements/velocity.js");
var Point		= require("./elements/point.js");

function ElementFactory() { }
ElementFactory.prototype = {
	createElement: function(type_class, params) {
		var file = "./elements/" + decamelize(type_class) + ".js";
		var Class = require(file);
		var tmp_obj = new Class(params);
		tmp_obj._class = type_class;
		tmp_obj.clone = function() {
			var clone = this._element_factory.screen.createElement(this._class);
			 for(var attr in this) {
				if(this[attr].clone != null) clone[attr] = this[attr].clone();
				else clone[attr] = this[attr];
			 }
			 return clone;
		};
		tmp_obj.__defineGetter__("height", function(){return this.retangle_definition().height});
		tmp_obj.__defineGetter__("width", function(){return this.retangle_definition().width});
		tmp_obj.stoped = false;
		tmp_obj.stop   = function(){
			this.stopped = true;
		};
		tmp_obj.resume = function(){
			this.stopped = false;
		};
		tmp_obj._element_factory = this;
		tmp_obj._orig_draw = tmp_obj.draw;
		var screen  = tmp_obj.screen = this.screen;
		var element = tmp_obj;
		if(tmp_obj.colision_area == null) tmp_obj.colision_area = tmp_obj.retangle_definition;
		if(tmp_obj._orig_draw != null) {
			tmp_obj.draw = function() {
				this._element_factory.default_before_draw_func(element);
				this._orig_draw(screen);
				this._element_factory.default_after_draw_func(element);
			};
		}
		tmp_obj.__defineGetter__("center", function() {
			return new Point(this.center_x(), this.center_y());
		});
		tmp_obj.bounce = function(element) {
			var eret = element.retangle_definition();
			var _this = this;
			setTimeout(function(){_this.orig_velocity = _this.velocity}, 10);
			if(this.center_x() <= eret.Ax && this.velocity.x > 0)
				this.velocity.x *= -1;
			if(this.center_x() >= eret.Bx && this.velocity.x < 0)
				this.velocity.x *= -1;
			if(this.center_y() <= eret.Ay && this.velocity.y > 0)
				this.velocity.y *= -1;
			if(this.center_y() >= eret.Cy && this.velocity.y < 0)
				this.velocity.y *= -1;
			this.velocity.ang += (Math.random() - 0.5) / 10;
		},
		tmp_obj.destroy = function() {
			if(this.before_destroy != null) this.before_destroy();
			this._element_factory.screen.removeElement(this);
		},
		tmp_obj.center_x = function() {
			var ret = this.retangle_definition();
			return(ret.Ax + ((ret.Bx - ret.Ax) / 2))
		};
		tmp_obj.center_y = function() {
			var ret = this.retangle_definition();
			return(ret.Ay + ((ret.Cy - ret.Ay) / 2))
		};
		tmp_obj.velocity = new Velocity();
		tmp_obj.velocity.element = tmp_obj;
		if(tmp_obj.solid == null) tmp_obj.solid = true;
		tmp_obj.move = function() {
			if(this.stopped) return;
			if((this.velocity.x == null || this.velocity.x == 0)
					&& (this.velocity.y == null || this.velocity.y == 0))
				return;
			if(this.flutuate != null && !this.flutuate && this._element_factory.screen.gravity != null) {
				//if(this.type != "ball") console.log("usando gravidade!");
				var current_time = (new Date()).getTime();
				if(this.last_fall == null) this.last_fall = current_time;
				var passed = current_time - this.last_fall;
				if(passed < 1) return;
				if(passed >= 100) {
					var to_add = this._element_factory.screen.gravity.get_velocity_alteration_in_ms(passed);
					this.velocity.add(to_add);
					this.last_fall = current_time;
				}
			}
			//this.velocity.dump();
			this.x += this.velocity.x;
			this.y += this.velocity.y;
			if(tmp_obj.on_move != null) tmp_obj.on_move();
		};
		tmp_obj.elementsColiding = function(element) {
		};
		tmp_obj.on_colide_with = function(type, sub) {
			if(this.types_to_colide == null) this.types_to_colide = {};
			this.types_to_colide[type] = sub;
		};
		tmp_obj.on_colide_with_multiple = function(type, sub) {
			if(this.types_to_multiple_colide == null) this.types_to_multiple_colide = {};
			this.types_to_multiple_colide[type] = sub;
		};
		tmp_obj.can_colide_with = function(element, reverse) {
			if(reverse == null) {
				if(!element.can_colide_with(this, false))return false;
			}
			if(this.do_not_colide_with != null) {
				var cant = this.do_not_colide_with;
				 for(var i = 0; i < cant.length; i++) {
					if(element.type == cant[i]) return false;
				 }
			}
			return true;
		};
		return tmp_obj;
	},
	default_before_draw_func: function(element) {
		var screen = this.screen;
		screen.ctx.save();
		screen.ctx.translate(element.x,element.y);
		if(element.solid && element.color != null) screen.ctx.fillStyle = element.color;
		else if(element.color != null) screen.ctx.strokeStyle = element.color;
		screen.ctx.beginPath();
	},
	default_after_draw_func: function(element) {
		var screen = this.screen;
		if(element.solid) screen.ctx.fill();
		else screen.ctx.stroke();
		screen.ctx.restore();
		if(element.draw_center_point) {
		        this.default_before_draw_func(element.center);
		        element.center.draw(screen);
		        this.default_after_draw_func(element.center);
		}
		if(element.draw_colision_area) {
		        this.default_before_draw_func(element.retangle_definition());
		        element.retangle_definition().draw(screen);
		        this.default_after_draw_func(element.retangle_definition());
		}
		if(element.draw_velocity) {
		        this.default_before_draw_func(element.velocity);
		        element.velocity.draw(screen);
		        this.default_after_draw_func(element.velocity);
		}
	 },
	//draw_retangle: false,
};
