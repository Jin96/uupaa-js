Sphere = (function() {

	var canvas;
	var ctx;

	var offsetX = 300;
	var offsetY = 300;
	var objectsInScene = new Array();
	var focalLength = 300;
	var cameraView = {x:0, y:0, z:0, rotX:0, rotY:0, rotZ:0};

	var space = 15;
	var PI = Math.PI;
	var radius = 200;
	var radian = PI/180;

	var mouseX = 0;
	var mouseY = 0;

	var objectRadius = 14;
	var scaleRatio = 0;
	var scaling = true;

	var nrOfFollowers = 32;
	var followRadius = 8;
	var minDistToLeader = 20;

	var sx = 0;
	var cx = 0;
	var sy = 0;
	var cy = 0;
	var sz = 0;
	var cz = 0;

	return function() {

		this.createSphere = function() {

			canvas = document.getElementById("sphere");
			ctx = canvas.getContext("2d");
ctx.xFlyweight = 1;

			if (canvas.getContext) {
				this.init();
			}
		}

		this.init = function() {

			// create sphere objects:
			for (var i=space; i<180; i+=space) {

				for (var angle=0; angle<360; angle+=space) {

					var object = {};
					var x = Math.sin(radian*i)*radius;
					object.x = Math.cos(angle*radian)*x;
					object.y = Math.cos(radian*i)*radius;
					object.z = Math.sin(angle*radian)*x;
					object.glow = .5;
					object.type = "sphere";
					objectsInScene.push(object);
				}
			}

			// create followers:
			for(var i=0; i<nrOfFollowers; i++) {

				var object = {};
				object.x = 0;
				object.y = 0;
				object.z = 0;
				object.momentumx = 0;
				object.momentumy = 0;
				object.momentumz = 0;

				var leader;

				this.assignLeader(object);

				object.type = "follow";
				objectsInScene.push(object);
			}

			var me = this;
//			canvas.addEventListener('mousemove', this.setMouseXY, false);
//            if (uu.ie) {
                uu.mousemove(canvas, function(evt) {
                    me.setMouseXY(evt);
                });
//            }
            if (uu.ie) {
            } else {
			    document.captureEvents(Event.MOUSEDOWN);
			}
			document.onmousedown = this.toggleScaling;
			setInterval(function() {
			    me.runtime(me)
			}, 40);
//			setInterval(this.runtime, 40, this);
		}

		// assign leader to follower:
		this.assignLeader = function(obj) {

			var leader;

			while(!leader || obj.leader.type != "sphere") {

				leader = objectsInScene[Math.floor(Math.random()*objectsInScene.length)];
				obj.leader = leader;
			}
		}

/*
		// retrieve mouse position from canvas:
		this.setMouseXY = function(e) {
			mouseX = e.layerX - offsetX - canvas.offsetLeft;
			mouseY = e.layerY - offsetY - canvas.offsetTop;
		}
 */
		// retrieve mouse position from canvas:
		this.setMouseXY = function(e) {
/*
			mouseX = e.layerX - offsetX - canvas.offsetLeft;
			mouseY = e.layerY - offsetY - canvas.offsetTop;
 */
			mouseX = e.ox - offsetX - canvas.offsetLeft;
			mouseY = e.oy - offsetY - canvas.offsetTop;
		}


		this.toggleScaling = function(e) {

			if(scaling) {

				scaling = false;
			}else{

				scaling = true;
			}
		}

		// custom array sort for z-sorting 3D objects:
		this.sortOnDepth = function(a, b) {

			return a.z - b.z;
		}

		// main loop:
		this.runtime = function(context) {

			// apply 3D axis rotations on camera view based on mouse position
			var rotYstep = mouseX/10000;
			var rotXstep = mouseY/10000;

			cameraView.rotY =  rotYstep;
			cameraView.rotX = -rotXstep;

			sx = Math.sin(cameraView.rotX);
			cx = Math.cos(cameraView.rotX);
			sy = Math.sin(cameraView.rotY);
			cy = Math.cos(cameraView.rotY);
			sz = Math.sin(cameraView.rotZ);
			cz = Math.cos(cameraView.rotZ);

			// fill the canvas with 10% alpha before new render to create cheap motion blur effect:
			ctx.fillStyle = 'rgba(0,0,0,0.1)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// z-sorting objects
			objectsInScene.sort(context.sortOnDepth);

			// render objects
			var l = objectsInScene.length-1;

ctx.lock();
			for (var i=l, obj; obj=objectsInScene[i]; i--) {

				switch(obj.type) {

					case "sphere":
						context.displayObject(obj);
						break;
					case "follow":
						context.displayFollower(obj);
						break;
				}

			}
ctx.unlock();
		}

		// display a sphere object:
		this.displayObject = function(object) {

			var xy, xz, yx, yz, zx, zy;

			// position of object relative to camera
			var x = object.x - cameraView.x;
			var y = object.y - cameraView.y;
			var z = object.z - cameraView.z;

			// rotation around x
			xy = cx*y - sx*z;
			xz = sx*y + cx*z;
			// rotation around y
			yz = cy*xz - sy*x;
			yx = sy*xz + cy*x;
			// rotation around z
			zx = cz*yx - sz*xy;
			zy = sz*yx + cz*xy;

			// change position
			object.x = zx;
			object.y = zy;
			object.z = yz;

			// render to screen
			scaleRatio = focalLength/(focalLength + yz);

			switch(scaling) {

				case true:
					scale = scaleRatio;
					break;
				case false:
					scale = 1;
					break;
			}

			if(object.glow > .5) {

				object.glow -= .02;
			}

			var radgrad = ctx.createRadialGradient(offsetX+object.x*scaleRatio, offsetY+object.y*scaleRatio, scale*.5, offsetX+object.x*scaleRatio, offsetY+object.y*scaleRatio, scale*objectRadius*.5);
			radgrad.addColorStop(0, '#8484d7');
			radgrad.addColorStop(object.glow, '#00008f');
			radgrad.addColorStop(1, 'rgba(0,0,143,0)');
			ctx.fillStyle = radgrad;
			ctx.fillRect(offsetX+object.x*scaleRatio-scale*objectRadius*.5, offsetY+object.y*scaleRatio-scale*objectRadius*.5, scale*objectRadius, scale*objectRadius);
		}

		// display a follow object:
		this.displayFollower = function(object) {

			// calculate distance to leader
			var distx = object.x - object.leader.x;
			var disty = object.y - object.leader.y;
			var distz = object.z - object.leader.z;

			// recalculate momentum
			object.momentumx -= Math.min(50, distx) / 100;
			object.momentumy -= Math.min(50, disty) / 100;
			object.momentumz -= Math.min(50, distz) / 100;

			// dampen the momentum a little
			object.momentumx *= 0.85;
			object.momentumy *= 0.85;
			object.momentumz *= 0.85;

			// change position
			object.x += object.momentumx;
			object.y += object.momentumy;
			object.z += object.momentumz;

			// render to screen
			scaleRatio = focalLength/(focalLength + object.z);

			switch(scaling) {

				case true:
					scale = scaleRatio;
					break;
				case false:
					scale = 1;
					break;
			}

			var radgrad = ctx.createRadialGradient(offsetX+object.x*scaleRatio, offsetY+object.y*scaleRatio, scale*.5, offsetX+object.x*scaleRatio, offsetY+object.y*scaleRatio, scale*followRadius*.5);
			radgrad.addColorStop(0, '#3f3f57');
			radgrad.addColorStop(0.5, '#3f3f57');
			radgrad.addColorStop(1, 'rgba(60,60,90,0)');
			ctx.fillStyle = radgrad;
			ctx.fillRect(offsetX+object.x*scaleRatio-scale*followRadius*.5, offsetY+object.y*scaleRatio-scale*followRadius*.5, scale*followRadius, scale*followRadius);

			// assign new leader when coming to close the current leader:
			if(distx<minDistToLeader && disty<minDistToLeader && distz<minDistToLeader) {

				object.leader.glow = 1.0;
				this.assignLeader(object);
			}
		}

		this.createSphere();
	}
})();
