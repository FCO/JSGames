function Screen(container, pars) {
	this.elements_by_id = {};
	if(!container)
		container = document.body;
	this.container	= container;
	this.canvas	= document.createElement("canvas");
	this.container.appendChild(this.canvas);
	this.ctx	= this.canvas.getContext('2d');
	this.elements	= [];
	for(var attr in pars)
		this.canvas.setAttribute(attr, pars[attr]);
	this.worker		= new Worker("Worker.js");
	var _this 		= this;
	this.worker.onmessage	= function(event){
		var msg = event.data;
		for(var cmd in msg) {
			console.log("cmd: " + cmd);
			console.log(msg[cmd]);
			_this[cmd].apply(_this, msg[cmd]);
		}
	};
}

Screen.prototype = {
	log:	function(msg){console.log(msg);},
	draw:	function(element) {
		this.log("screen.draw: " + element);
		this.log(element);
		this.ctx.save();
		this.log("save()");
		this.ctx.translate(element.center.x,element.center.y);
		this.log("this.ctx.translate(" + element.center.x + ", " + element.center.y + ")");
		if(element.solid && element.color != null) {
			this.ctx.fillStyle = element.color;
			this.log("this.ctx.fillStyle = " + element.color);
		} else if(element.color != null) {
			this.ctx.strokeStyle = element.color;
			this.log("this.ctx.strokeStyle = " + element.color);
		}
		this.ctx.beginPath();
		this.log("this.ctx.beginPath()");

		var path = element.path;
		for(var i = 0; i < path.length; i++) {
			for(cmd in path[i]) {
				this.ctx[cmd].apply(this.ctx, path[i][cmd]);
				this.log("this.ctx[" + cmd + "].apply(this.ctx, " + path[i][cmd] + ")");
			}
		}

		if(element.solid) {
			this.ctx.fill();
			this.log("this.ctx.fill()");
		} else {
			this.ctx.stroke();
			this.log("this.ctx.stroke()");
		}
		this.ctx.restore();
		this.log("this.ctx.restore()");
		if(element.draw_center_point) {
		   this.default_before_draw_func(element.center);
		   element.center.draw(this);
		   this.default_after_draw_func(element.center);
		}
	},
	run:	function() {
		this.sendCmd("run");
	},
	callDraw:	function() {
		this.sendCmd("callDraw");
	},
	createElement:	function() {
		var args = [];
		for(var i = 0; i < arguments.length; i++)
			args.push(arguments[i]);
		this.sendCmd("createElement", args);
	},
	createGenericElement:	function(eid) {
		var new_element = new ScreenGenericElement(eid);
		new_element.__screen = this;
		this.elements_by_id[eid] = new_element;
		this.lastElement = new_element;
		new_element.__sendUpdate();
	},
	updateGenericElement:	function(eid, data) {
		this.log("eid: " + eid);
		this.elements_by_id[eid].__update_data(data);
	},
	getLastElement:	function() {
		var tmp = this.lastElement;
		this.lastElement = null;
		return tmp;
	},
	sendCmd:	function(cmd, pars) {
		var command = {};
		command[cmd] = pars;
		this.worker.postMessage(command);
	},
};

function ScreenGenericElement(eid) {
	this.eid = eid;
}

ScreenGenericElement.prototype = {
	__sendCmd: function(cmd, pars) {
		if(!this.__screen) throw "First, please set '__screen'.";
		this.__screen.sendCmd(cmd, pars);
	},
	__real_values:	{},
	__sendUpdate:	function() {
		this.__sendCmd("element", [this.eid, {sendUpdate: []}]);
	},
	__update_data:	function(data) {
		this.__screen.log("update_data()");
		for(var key in data) {
			if(data[key] != "__function__") {
				this.__real_values[key] = data[key];
				this.__defineGetter__(key, function(){
					var name = key;
					return this.__real_values[name];
				});
				this.__defineSetter__(key, function(value){
					var name = key;
					var val = {};
					val[name] = [value];
					this.__sendCmd("element", [this.eid, val]);
				});
			} else {
				this[key] = function() {
					var args = [];
					for(var i = 0; i < arguments.length; i++)
						args.push(arguments[i]);
					var name = key;
					var val = {};
					console.log(args);
					val[name] = args;
					this.__sendCmd("element", [this.eid, val]);
				}
			}
		}
	},
};
