	// Global Variables, first object empty, because selection starts with 1
	var objects=[{}], canvas, gl, program, flag = false;
    var wMatrix = mat4.create();

	// Init function called onload body event
	var Init = function() {
		canvas = document.getElementById('webgl-canvas');
		gl = canvas.getContext('webgl');
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;

		if (!gl) {
			alert('Please use new browser!');
			return;
		}

        // Create view matrix
        let vMatrix = mat4.create();

        // Create projection matrix
        let pMatrix = mat4.create();

		// Set a background color
		gl.clearColor(0.5, 0.5, 0.5, 1.0);
		gl.enable(gl.DEPTH_TEST);

        mat4.lookAt(vMatrix, vec3.fromValues(0, 0, -10), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
        mat4.invert(vMatrix, vMatrix);
        mat4.perspective(pMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.4, 2000.0);

		// Create 9 objects
		try {
			objects.push(new Pyramid(gl, [2, 2, 0]));
			objects.push(new Pyramid(gl, [0, 2, 0]));
			objects.push(new Pyramid(gl, [-2, 2, 0]));
			objects.push(new Pyramid(gl, [2, 0, 0]));
			objects.push(new Sphere(gl, [0, 0, 0]));
			objects.push(new Pyramid(gl, [-2, 0, 0]));
			objects.push(new Pyramid(gl, [2, -2, 0]));
			objects.push(new Pyramid(gl, [0, -2, 0]));
			objects.push(new Pyramid(gl, [-2, -2, 0]));
			objects.push(new Global(gl, [0, 0, 0]));
		} catch (E) {
			console.log(E);
		}

		// Render all objects
		// Apply Lines if selected
		var flag = false;
		function render() {
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			objects.forEach((e, i) => {
				if (i != 0) {
					e.draw(gl, pMatrix, vMatrix);
                    if (e.selected) e.drawLines(gl, pMatrix);
					if (!flag) {
						e.start();
						if (i == objects.length - 1) flag = true;
					}
				}
			})
			requestAnimationFrame(render);
		}
		// Start rendering
		requestAnimationFrame(render);




		// Handle user input events
		document.addEventListener("keydown", function(event) {
			// Selecting object, one or all if 0 is pressed
			if(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) {
				objects['selected'] = [];
				objects.forEach((e, i) => {
					e.selected = false;
					if (event.key == '0' || i == event.key) {
							if (i != 0) {
								objects['selected'].push(e);
								e.global = (event.key == '0');
								e.selected = true;
							}
					}
				});
			}

			// If no object selected, exit
			if (objects['selected'] === null || objects['selected'] === undefined || objects['selected'].lenght == 0) return;

			// Handle event.key inputs
			switch (event.key) {
				case "w" : {
					// objects['selected'].map(e => e.rotateX(0.1));
					objects['selected'].map(e => e.update(0.1,0,0));
					break;
				}
				case "s" : {
                    // objects['selected'].map(e => e.rotateX(-0.1));
                    objects['selected'].map(e => e.update(-0.1,0,0));
					break;
			  }
				case "e" : {
                    // objects['selected'].map(e => e.rotateY(0.1));
                    objects['selected'].map(e => e.update(0,0.1,0));
					break;
				}
				case "q" : {
                    //objects['selected'].map(e => e.rotateY(-0.1));
                    objects['selected'].map(e => e.update(0,-0.1,0));
					break;
				}
				case "d" : {
                    // objects['selected'].map(e => e.rotateZ(0.1));
                    objects['selected'].map(e => e.update(0,0,0.1));
					break;
				}
				case "a" : {
                    // objects['selected'].map(e => e.rotateZ(-0.1));
                    objects['selected'].map(e => e.update(0,0,-0.1));
					break;
				}
				case "ArrowDown" : {
					// objects['selected'].map(e => e.translate([0, -0.03, 0]));
                    objects['selected'].map(e => e.update(0,0,0, [0, -0.03, 0]));
					break;
				}
				case "ArrowUp" : {
                    // objects['selected'].map(e => e.translate([0, 0.03, 0]));
                    objects['selected'].map(e => e.update(0,0,0, [0, 0.03, 0]));
                    break;
				}
				case "ArrowLeft" : {
                    // objects['selected'].map(e => e.translate([-0.03, 0, 0]));
                    objects['selected'].map(e => e.update(0,0,0, [-0.03, 0, 0]));
                    break;
				}
				case "ArrowRight" : {
                    // objects['selected'].map(e => e.translate([0.03, 0, 0]));
                    objects['selected'].map(e => e.update(0,0,0, [0.03, 0, 0]));
                    break;
				}
				case "," : {
                    // objects['selected'].map(e => e.translate([0, 0, 0.01]));
                    objects['selected'].map(e => e.update(0,0,0, [0, 0, 0.03]));
                    break;
				}
				case "." : {
                    // objects['selected'].map(e => e.translate([0, 0, -0.01]));
                    objects['selected'].map(e => e.update(0,0,0, [0, 0, -0.03]));
                    break;
				}
				case "x" : {
                    //objects['selected'].map(e => e.scaleM([0.9, 1, 1]));
                    objects['selected'].map(e => e.update(0,0,0, [0,0,0], [0.9, 1, 1]));
                    break;
				}
				case "y" : {
                    // objects['selected'].map(e => e.scaleM([1, 0.9, 1]));
                    objects['selected'].map(e => e.update(0,0,0, [0,0,0], [1, 0.9, 1]));
                    break;
				}
				case "z" : {
                    // objects['selected'].map(e => e.scaleM([1, 1, 0.9]));
                    objects['selected'].map(e => e.update(0,0,0, [0,0,0], [1, 1, 0.9]));
                    break;
				}
				case "X" : {
                    // objects['selected'].map(e => e.scaleM([1.1, 1, 1]));
                    objects['selected'].map(e => e.update(0,0,0, [0,0,0], [1.1,1,1]));
                    break;
				}
				case "Y" : {
                    // objects['selected'].map(e => e.scaleM([1, 1.1, 1]));
                    objects['selected'].map(e => e.update(0,0,0, [0,0,0], [1,1.1,1]));
                    break;
				}
				case "Z" : {
                    // objects['selected'].map(e => e.scaleM([1, 1, 1.1]));
                    objects['selected'].map(e => e.update(0,0,0, [0,0,0], [1,1,1.1]));
                    break;
				}
			}
		});
	}
