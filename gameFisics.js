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

function Velocity(x, y) {
   if(x != null) this.x = x; else this.x = 0;
   if(y != null) this.y = y; else this.y = 0;
}

Velocity.prototype = {
   _x:    0,
   _y:    0,
   _ang:  null,
   _mod:  null,
   color: "#FF0000",
   set x(value) {
      this._x = value;
      this.set_cart(this.x, this.y);
   },
   get x(){return this._x},
   set y(value) {
      this._y = value;
      this.set_cart(this.x, this.y);
   },
   get y(){return this._y},

   set ang(value){
      this._ang = value;
      this.set_vector(this.ang, this.mod);
   },
   get ang(){return this._ang},

   set mod(value){
      this._mod = value;
      this.set_vector(this.ang, this.mod);
   },
   get mod(){return this._mod},

   get point() {
      return new Point(this.x, this.y);
   },

   set_cart: function(x, y) {
      this._mod = Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 1 / 2)
      this._ang = Math.atan2(x, y);
   },
   set_vector: function(ang, mod) {
      this._x = Math.sin(ang) * mod;
      this._y = Math.cos(ang) * mod;
   },
   draw: function(screen) {
      screen.ctx.moveTo(this.element.center_x(), this.element.center_y());  
      screen.ctx.lineTo(this.element.center_x() + (this.x * 20), this.element.center_y() + (this.y * 20));
   },
   add: function(vel) {
//this.dump();
//vel.dump();
      this.x += vel.x;
      this.y += vel.y;
//this.dump();
   },
   multiply: function(value) {
      this.x *= value;
      this.y *= value;
   },
   clone: function(){
      var clone = new Velocity();
      clone.x = this.x;
      clone.y = this.y;
      return clone;
   },
   dump: function() {
      if(console.log == null) return;
      console.log("x: " + this.x);
      console.log("y: " + this.y);
   },
};

function Point(x, y) {
   if(x != null) this.x = x;
   if(y != null) this.y = y;
}
Point.prototype = {
   x:     0,
   y:     0,
   color: "#FF0000",
   solid: true,
   get vector() {
      return new Velocity(this.x, this.y);
   },
   clone: function(){
      var clone = new Point();
      for(var attr in this) {
         if(this[attr].clone != null) clone[attr] = this[attr].clone();
         else clone[attr] = this[attr];
      }
      return clone;
   },
   draw: function() {
      screen.ctx.arc(0, 0, 2, 0, Math.PI * 2, true);
   },
};

function Poligon() {
   this.points = [];
}
Poligon.prototype = {
   set x(value) {
      this.changed = true;
      this._x = value;
   },
   get x() {return this._x},
   set y(value) {
      this.changed = true;
      this._y = value;
   },
   get y() {return this._y},
   angle: 0,
   //points: [],
   resize: function(val) {
      for(var i = 0; i < this.points.length; i++) {
         this.points[i].x *= val;
         this.points[i].y *= val;
      }
   },
   rotate: function(ang) {
      this.changed = true;
      this.angle += ang;
      for(var i = 0; i < this.points.length; i++) {
         var tmp_vector = this.points[i].vector;
         tmp_vector.ang += ang;
         this.points[i] = tmp_vector.point;
      }
   },
   add_vertice: function(x, y) {
      this.changed = true;
      var tmp_p = new Point(x, y);
      this.points.push(tmp_p);
   },
   retangle_definition: function() {
      if(! this.changed) return this.last_return;
      var ret = new Retangle();
      var min_x = this._element_factory.screen.width;
      var max_x = 0;
      var min_y = this._element_factory.screen.height;
      var max_y = 0;
      for(var i = 0; i < this.points.length; i++) {
         if(this.points[i].x > max_x) max_x = this.points[i].x;
         if(this.points[i].x < min_x) min_x = this.points[i].x;
         if(this.points[i].y > max_y) max_y = this.points[i].y;
         if(this.points[i].y < min_y) min_y = this.points[i].y;
      }

      ret.Ax = this.x + min_x;
      ret.Ay = this.y + min_y;
      ret.Bx = this.x + max_x;
      ret.By = this.y + min_y;
      ret.Cx = this.x + max_x;
      ret.Cy = this.y + max_y;
      ret.Dx = this.x + min_x;
      ret.Dy = this.y + max_y;

      this.last_return = ret;
      this.changed = false;

      return ret;
   },
   draw: function(screen) {
      screen.ctx.moveTo(this.points[0].x, this.points[0].y);
      for(var i = 1; i < this.points.length; i++) {
         screen.ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      if(!this.solid){
         screen.ctx.lineTo(this.points[0].x, this.points[0].y);
      }
   }
};

function Quad() { }
Quad.prototype = {
   solid:        false,
   color:        "#000000",
   Ax:           0,
   Ay:           0,
   Bx:           0,
   By:           0,
   Cx:           0,
   Cy:           0,
   Dx:           0,
   Dy:           0,
   _x:           0,
   _y:           0,
   _width:       0,
   _height:      0,
   get x(){
      return this._x;
   },
   set x(value) {
      this._x = value;
      this.Ax = value;
      this.Bx = value + this.width;
      this.Cx = value + this.width;
      this.Dx = value;
   },
   get y(){
      return this._y;
   },
   set y(value) {
      this._y = value;
      this.Ay = value;
      this.By = value;
      this.Cy = value + this.height;
      this.Dy = value + this.height;
   },
   get width(){
      return this._width;
   },
   set width(value) {
      this._width = value;
      this.Bx = value + this.x;
      this.Cx = value + this.x;
   },
   get height(){
      return this._height;
   },
   set height(value) {
      this._height = value;
      this.Cy = value + this.y;
      this.Dy = value + this.y;
   },
   retangle_definition: function() {
      var ret = new Retangle();
      ret.Ax = this.Ax;
      ret.Bx = this.Bx;
      ret.Cx = this.Cx;
      ret.Dx = this.Dx;

      ret.Ay = this.Ay;
      ret.By = this.By;
      ret.Cy = this.Cy;
      ret.Dy = this.Dy;
      return ret;
   },
   clone: function() {
      var clone = new Retangle();
      for(var attr in this) {
         if(this[attr].clone != null) clone[attr] = this[attr].clone();
         else clone[attr] = this[attr];
      }
      return clone;
   },
   draw: function(screen) {
         screen.ctx.moveTo(0, 0);  
         screen.ctx.lineTo(this.width, 0);
         //screen.ctx.moveTo(this.width, 0);
         screen.ctx.lineTo(this.width, this.height);
         //screen.ctx.moveTo(this.width, this.height);
         screen.ctx.lineTo(0, this.height);
         //screen.ctx.moveTo(0, this.height);
         screen.ctx.lineTo(0, 0);
   },
};

function Border() {
   this.draw_colision_area = Border.draw_colision_area;
   this.draw_velocity = Border.draw_velocity;
}
Border.prototype = {
   do_not_colide_with: ["Border"],
   solid:              false,
   color:              "#000000",
   set x(value) {
      this._x = value;
      this._y = null;
   },
   get x(){
      return this._x;
   },
   set y(value) {
      this._y = value;
      this._x = null;
   },
   get y(){
      return this._y;
   },
   retangle_definition: function() {
      var ret = new Retangle();
      if(this.x) {
         ret.Ax = this.x;
         ret.Bx = this.x;
         ret.Cx = this.x;
         ret.Dx = this.x;

         ret.Ay = 1;
         ret.By = 1;
         ret.Cy = this._element_factory.screen.height;
         ret.Dy = this._element_factory.screen.height;
      } else if(this.y) {
         ret.Ay = this.y;
         ret.By = this.y;
         ret.Cy = this.y;
         ret.Dy = this.y;

         ret.Ax = 1;
         ret.Bx = this._element_factory.screen.width;
         ret.Cx = this._element_factory.screen.width;
         ret.Dx = 1;
      }
      return ret;
   },
   draw: function(screen) {
      if(this.x != null){
         screen.ctx.moveTo(0, 0);  
         screen.ctx.lineTo(0, this._element_factory.screen.height);
      }
      else if(this.y != null) {
         screen.ctx.moveTo(0, 0);  
         screen.ctx.lineTo(this._element_factory.screen.width, 0);
      } else console.log("fudeu!");
   },
};

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
   has_gravity: function(gravity_x, gravity_y) {
      this.gravity = new Aceleration(gravity_x, gravity_y);
   },
   createElement: function(elementType, hashParams) {
      var tmp_ele = this.eleFact.createElement(elementType, hashParams);
      tmp_ele.type = elementType;
      this.elements.push(tmp_ele);
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
         coliding[i].colides = null
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
};

function ElementFactory() { }
ElementFactory.prototype = {
   createElement: function(type_class, params){
      var eval_code = "new " + type_class + "()";
      var tmp_obj = eval(eval_code);
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
      var screen  = this.screen;
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
      screen.ctx.save();
      screen.ctx.translate(element.x,element.y);
      if(element.solid && element.color != null) screen.ctx.fillStyle = element.color;
      else if(element.color != null) screen.ctx.strokeStyle = element.color;
      screen.ctx.beginPath();
   },
   default_after_draw_func: function(element) {
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

function Arc() { }
Arc.prototype = {
   draw: function(screen) {
      screen.ctx.arc(0, 0, this.radius, 0, Math.PI * 2, true);
   },
   retangle_definition: function(){
      var ret = new Retangle();
      ret.Ax = this.x - this.radius;
      ret.Ay = this.y - this.radius;

      ret.Bx = this.x + this.radius;
      ret.By = this.y - this.radius;

      ret.Cx = this.x + this.radius;
      ret.Cy = this.y + this.radius;

      ret.Dx = this.x - this.radius;
      ret.Dy = this.y + this.radius;
      return ret;
   },
   conf: function(hash){},
   color:  "#000000",
   radius: 10,
   x:      0,
   y:      0
};
