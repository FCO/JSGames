importScripts("Elements.js");

function World() {
	this.factory = new ElementFactory();
	this.factory.world = this;
	var _this = this;
	this.factory.log = function(msg){_this.log(msg)};
}

World.prototype = {
	proportion:	1,
	origin:		new Point(0, 0),
	sizeToPixel:	function(size) {
		return size * this.proportion;
	},
	pointToPixelSize:	function(point) {
		return point.times(this.proportion);
	},
	pointToPixel:	function(point) {
		return this.pointToPixelSize(point).translate(this.origin);
	},
        sendCmd:        function(cmd, pars) {
                var command = {};
                command[cmd] = pars;
                try{
			self.postMessage(command);
		} catch(e) {
			this.log("ERROR: sending cmd: " + cmd);
			//this.log("ERROR: sending message: {" + cmd + ": " + JSON.stringify(command) + "}");
		}
        },
        log:    function(msg) {
                this.sendCmd("log", [msg]);

        },
	run:	function() {
		this.log("running...");
	},
	callDraw:	function() {
		var elements = this.factory.elements;
		for(var i = 0; i < elements.length; i++) {
			if(elements[i].drawable) {
				this.draw(elements[i]);
			}
		}
	},
	draw:	function(element) {
		if(element.center) element.center = this.pointToPixel(element.center);
		var hash = element.toHash();
		for(var key in hash) {
			this.log(key);
			this.log(hash[key]);
		}
		this.sendCmd("draw", [hash]);
	},
	createElement:	function(eid) {
		var element = this.factory.createElement.apply(this.factory, arguments);
		//this.sendCmd("createGenericElement", [element.eid]);
		this.element(element.eid, {sendUpdate: []});
>>>>>>> a8ec6838ea172eb5aeed5092efe1423f2d349dd9
	},
	element:	function(eid, data) {
		this.log("element: " + eid + ", " + JSON.stringify(data));
		this.log(this.factory.elements_by_id);
		var element = this.factory.getElementById(eid);
		for(var cmd in data) {
			this.log("element: CMD: " + cmd);
			if(element.genericFunctions[cmd]) {
				this.log("element.genericFunctions[" + cmd + "].apply(" + element + ", " + JSON.stringify(data[cmd]) + ")");
				element.genericFunctions[cmd].apply(element, data[cmd]);
			}
		}
	},
};

var world = new World();

self.onmessage = function(event) {
	var msg = event.data;
	world.log("MSG: " + JSON.stringify(msg));
	for(var cmd in msg) {
		world.log("world[" + cmd + "].apply(world, " + JSON.stringify(msg[cmd]) + ")");
		if(!world[cmd])
			throw "Command '" + cmd + "' does not exists.";
		world[cmd].apply(world, msg[cmd]);
	}
}
