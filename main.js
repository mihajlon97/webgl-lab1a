	// Global Variables
	var objects=[{}], canvas, gl, program;

	// Attributes and Uniform Locations
	var positionLocation;
	var colorLocation;
	var mMatrixLocation;
	var projMatrixLocation;

	// Matrices
	var translationMatrix = mat4.create();
	var rotationMatrix = mat4.create();
	var scaleMatrix = mat4.create();
	var identityMatrix = mat4.create();

	var Init = function() {
		canvas = document.getElementById('webgl-canvas');
		gl = canvas.getContext('webgl');
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;

		if (!gl) {
        alert('Please use new browser!');
        return;
    }

    // set a background color
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);

		let pMatrix = mat4.create();
    const asp = canvas.width/canvas.height;
    const bottom = -1;
    const zNear = 0.1;
    const zFar = 100.0;

		mat4.perspective(pMatrix, 45, asp, zNear, zFar, pMatrix);
    try {
				objects.push(new Pyramid(gl, [-0.7, 0.6, -2]));
        objects.push(new Pyramid(gl));
				objects.push(new Pyramid(gl, [0.7, 0.6, -2]));
				objects.push(new Pyramid(gl, [-0.7, -0.1, -2]));
				objects.push(new Pyramid(gl, [0, -0.1, -2]));
				objects.push(new Pyramid(gl, [0.7, -0.1, -2]));
				objects.push(new Pyramid(gl, [-0.7, -0.8, -2]));
				objects.push(new Pyramid(gl, [0, -0.8, -2]));
				objects.push(new Pyramid(gl, [0.7, -0.8, -2]));
    } catch (E) {
			console.log(E);
		}

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
				objects.forEach((e, i) => { if (i != 0) { e.draw(gl, pMatrix); } })
        requestAnimationFrame(render);
    }

    // Start rendering
    requestAnimationFrame(render);

		document.addEventListener("keydown", function(event) {

			if(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) {
				objects['selected'] = [];
				objects.forEach((e, i) => { if (event.key == '0' || i == event.key) { if (i != 0) objects['selected'].push(e); } });
			}

			if (objects['selected'] === null || objects['selected'] === undefined || objects['selected'].lenght == 0) return;
			switch (event.key) {
				case "w" : {
						objects['selected'].map(e => e.update(0.1, 0.00, 0.00));
						break;
				}
				case "s" : {
					objects['selected'].map(e => e.update(-0.1, 0.00, 0.00));
					break;
			  }
				case "q" : {
					objects['selected'].map(e => e.update(0.00, -0.1, 0.00));
					break;
				}
				case "e" : {
					objects['selected'].map(e => e.update(0.00, 0.1, 0.00));
					break;
				}
				case "d" : {
					objects['selected'].map(e => e.update(0.00, 0.00, 0.1));
					break;
				}
				case "a" : {
					objects['selected'].map(e => e.update(0.00, 0.00, -0.1));
					break;
				}
				case "ArrowDown" : {
					objects['selected'].map(e => e.update(0.00, 0.00, 0.00, [0, -0.03, 0]));
					break;
				}
				case "ArrowUp" : {
					objects['selected'].map(e => e.update(0.00, 0.00, 0.00, [0, 0.03, 0]));
					break;
				}
				case "ArrowLeft" : {
					objects['selected'].map(e => e.update(0.00, 0.00, 0.00, [-0.03, 0, 0]));
					break;
				}
				case "ArrowRight" : {
					objects['selected'].map(e => e.update(0.00, 0.00, 0.00, [0.03, 0, 0]));
					break;
				}
				case "," : {
					objects['selected'].map(e => e.update(0.00, 0.00, 0.00, [0, 0, 0.01]));
					break;
				}
				case "." : {
					objects['selected'].map(e => e.update(0.00, 0.00, 0.00, [0, 0, -0.01]));
					break;
				}
				case "x" : {
					objects['selected'].map(e => e.update(0.00, 0.00, 0.00, [0, 0, 0], [0.9, 1, 1]));
					break;
				}
				case "y" : {
					objects['selected'].map(e => e.update(0.00, 0.00, 0.00, [0, 0, 0], [1, 0.9, 1]));
					break;
				}
				case "c" : {
					objects['selected'].map(e => e.update(0.00, 0.00, 0.00, [0, 0, 0], [1, 1, 0.9]));
					break;
				}
				case "X" : {
					objects['selected'].map(e => e.update(0.00, 0.00, 0.00, [0, 0, 0], [1.1, 1, 1]));
					break;
				}
				case "Y" : {
					objects['selected'].map(e => e.update(0.00, 0.00, 0.00, [0, 0, 0], [1, 1.1, 1]));
					break;
				}
				case "C" : {
					objects['selected'].map(e => e.update5(0.00, 0.00, 0.00, [0, 0, 0], [1, 1, 1.1]));
					break;
				}
			}
		});


	}