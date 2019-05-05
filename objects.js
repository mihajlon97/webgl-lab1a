// Pyramid object
// Expected parameter, gl instance and object position
function Pyramid(gl, position = [0, 0, 0]) {

	// Shader program
	if (Pyramid.shaderProgram === undefined) {
		Pyramid.shaderProgram = initShaderProgram(gl, "vertex-shader", "fragment-shader");
		if (Pyramid.shaderProgram === null) {
			throw new Error('Creating the shader program failed.');
		}
		Pyramid.locations = {
			attribute: {
				vertPosition: gl.getAttribLocation(Pyramid.shaderProgram, "vertPosition"),
				vertColor: gl.getAttribLocation(Pyramid.shaderProgram, "vertColor"),
				aNormal: gl.getAttribLocation(Pyramid.shaderProgram, "aNormal"),
			},
			uniform: {
				mMatrix: gl.getUniformLocation(Pyramid.shaderProgram, "mMatrix"),
				wMatrix: gl.getUniformLocation(Pyramid.shaderProgram, "wMatrix"),
				vMatrix: gl.getUniformLocation(Pyramid.shaderProgram, "vMatrix"),
				mMatrixInv: gl.getUniformLocation(Pyramid.shaderProgram, "mMatrixInv"),
				pMatrix: gl.getUniformLocation(Pyramid.shaderProgram, "pMatrix"),
				camera: gl.getUniformLocation(Pyramid.shaderProgram, "camera")
			}
		};
		gl.enableVertexAttribArray(Pyramid.locations.attribute.vertPosition);
		gl.enableVertexAttribArray(Pyramid.locations.attribute.vertColor);
		gl.enableVertexAttribArray(Pyramid.locations.attribute.aNormal);
	}

	// Buffers
	if (Pyramid.buffers === undefined) {
		// Create a buffer with the vertex positions
		// 3 coordinates per vertex, 3 vertices per triangle
		// 2 triangles make up the ground plane, 4 triangles make up the sides
		const pBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
		let vertices = [
			-0.5, 0.0, -0.5,
			0.5, 0.0, -0.5,
			0.5, 0.0, 0.5,

			-0.5, 0.0, -0.5,
			0.5, 0.0, 0.5,
			-0.5, 0.0, 0.5,

			-0.5, 0.0, -0.5,
			0.5, 0.0, -0.5,
			0.0, 1.0, 0.0,

			0.5, 0.0, -0.5,
			0.5, 0.0, 0.5,
			0.0, 1.0, 0.0,

			0.5, 0.0, 0.5,
			-0.5, 0.0, 0.5,
			0.0, 1.0, 0.0,

			-0.5, 0.0, 0.5,
			-0.5, 0.0, -0.5,
			0.0, 1.0, 0.0];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		// Create a buffer with the vertex colors
		const cBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		let colors = [
			255, 255, 255,
			255, 255, 255,
			255, 255, 255,

			255, 255, 255,
			255, 255, 255,
			255, 255, 255,

			0, 0, 1,
			0, 0, 1,
			0, 0, 1,

			1, 0, 0,
			1, 0, 0,
			1, 0, 0,

			0, 0, 1,
			0, 0, 1,
			0, 0, 1,

			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);


		// Lines
		const lBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, lBuffer);

		let lineVertices = [
			0.0, 1.1, 0.0,
			0.0, -1.1, 0.0,

			1.1, 0.0, 0.0,
			-1.1, 0.0, 0.0,

			0.0, 0.0, 1.1,
			0.0, 0.0, -1.1
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineVertices), gl.STATIC_DRAW);
		lBuffer.itemSize = 3;
		lBuffer.numItems = 6;


		const liBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, liBuffer);

		var lineIndices = [
			0, 1,
			2, 3,
			4, 5
		];
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lineIndices), gl.STATIC_DRAW);
		liBuffer.itemSize = 1;
		liBuffer.numItems = 6;

		const lcBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, lcBuffer);

		var lineColors = [
			0.0, 1.0, 0.0, 1.0,
			0.0, 1.0, 0.0, 1.0,

			1.0, 0.0, 0.0, 1.0,
			1.0, 0.0, 0.0, 1.0,

			0.0, 0.0, 1.0, 1.0,
			0.0, 0.0, 1.0, 1.0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineColors), gl.STATIC_DRAW);
		lcBuffer.itemSize = 4;
		lcBuffer.numItems = 6;


		//Create a buffer with the normals
		const nBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
		const norm = Math.sqrt(5)/2;
		let normals = [
			0, -1, 0,
			0, -1, 0,
			0, -1, 0,

			0, -1, 0,
			0, -1, 0,
			0, -1, 0,

			0, 0.5/norm, -1/norm,
			0, 0.5/norm, -1/norm,
			0, 0.5/norm, -1/norm,

			1/norm, 0.5/norm, 0,
			1/norm, 0.5/norm, 0,
			1/norm, 0.5/norm, 0,

			0, 0.5/norm, 1/norm,
			0, 0.5/norm, 1/norm,
			0, 0.5/norm, 1/norm,

			-1/norm, 0.5/norm, 0,
			-1/norm, 0.5/norm, 0,
			-1/norm, 0.5/norm, 0];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

		const lightBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, lightBuffer);
		let light = [-1,-1,-1];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(light), gl.STATIC_DRAW);

		Pyramid.buffers = {
			pBuffer: pBuffer,
			cBuffer: cBuffer,
			lBuffer: lBuffer,
			liBuffer: liBuffer,
			lcBuffer: lcBuffer,
			nBuffer: nBuffer,
			lightBuffer: lightBuffer,
			pComponents: 3,
			cComponents: 3,
			nComponents: 3,
			lightComponents: 3,
		};
	}

	// Object Variables
	this.lcPosition = position;
	this.scale = [1, 1, 1];
	this.mMatrix = mat4.create();
	this.lcMatrix = mat4.create();
	this.mMatrixInv = mat3.create();
	this.selected = false;
	this.global = false;

	// Object draw function
	this.draw = function (gl, pMatrix, vMatrix) {
		gl.useProgram(Pyramid.shaderProgram);
		gl.uniformMatrix4fv(Pyramid.locations.uniform.pMatrix, false, pMatrix);
		gl.uniformMatrix4fv(Pyramid.locations.uniform.mMatrix, false, this.mMatrix);
		gl.uniformMatrix4fv(Pyramid.locations.uniform.wMatrix, false, wMatrix);
		gl.uniformMatrix4fv(Pyramid.locations.uniform.vMatrix, false, vMatrix);
		gl.uniformMatrix3fv(Pyramid.locations.uniform.mMatrixInv, false, this.mMatrixInv);
		gl.uniform3fv(Pyramid.locations.uniform.camera, [0, -10, 0]);
		gl.uniform4fv(Pyramid.locations.uniform.uColor, [1.0, 0.0, 0.0, 1.0]);

		gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.buffers.pBuffer);
		gl.vertexAttribPointer(Pyramid.locations.attribute.vertPosition, Pyramid.buffers.pComponents, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.buffers.cBuffer);
		gl.vertexAttribPointer(Pyramid.locations.attribute.vertColor, Pyramid.buffers.cComponents, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.buffers.nBuffer);
		gl.vertexAttribPointer(Pyramid.locations.attribute.aNormal, Pyramid.buffers.nComponents, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 18);
	};


	// Object drawLines function which are displayed as local coordinates in colors R for x, G for y and B for z axis
	this.drawLines = function (gl, pMatrix) {
		gl.useProgram(Pyramid.shaderProgram);

		gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.buffers.lBuffer);
		gl.vertexAttribPointer(Pyramid.locations.attribute.vertPosition, Pyramid.buffers.lBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.buffers.lcBuffer);
		gl.vertexAttribPointer(Pyramid.locations.attribute.vertColor, Pyramid.buffers.lcBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.buffers.nBuffer);
		gl.vertexAttribPointer(Pyramid.locations.attribute.aNormal, Pyramid.buffers.nComponents, gl.FLOAT, false, 0, 0);


		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Pyramid.buffers.liBuffer);
		gl.uniformMatrix4fv(Pyramid.locations.uniform.pMatrix, false, pMatrix);
		gl.uniformMatrix4fv(Pyramid.locations.uniform.mMatrix, false, this.lcMatrix);

		gl.drawElements(gl.LINES, Pyramid.buffers.liBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	};

	this.start = function () {
		mat4.translate(this.mMatrix, this.mMatrix, this.lcPosition);
		mat4.translate(this.lcMatrix, this.lcMatrix, this.lcPosition);
	};

	this.update = function (x, y, z, position = [0, 0, 0], scale = [1, 1, 1]) {
		// Global transformations
		if (this.global) {
			// Move the Object to the center
			mat4.identity(this.mMatrix);
			// Transform the object
			mat4.scale(this.mMatrix, this.mMatrix, scale);
			mat4.rotateX(this.mMatrix, this.mMatrix, x);
			mat4.rotateY(this.mMatrix, this.mMatrix, y);
			mat4.rotateZ(this.mMatrix, this.mMatrix, z);
			mat4.translate(this.mMatrix, this.mMatrix, position);

			// Multiply with Local Coordinates to get to the right position
			mat4.multiply(this.mMatrix, this.mMatrix, this.lcMatrix);

			// Move Local Coordinates where the object is
			mat4.identity(this.lcMatrix);
			mat4.multiply(this.lcMatrix, this.lcMatrix, this.mMatrix);
		}
		// Local transformations
		else {
			// Transform Object
			mat4.translate(this.mMatrix, this.mMatrix, position);
			mat4.rotateX(this.mMatrix, this.mMatrix, x);
			mat4.rotateZ(this.mMatrix, this.mMatrix, z);
			mat4.rotateY(this.mMatrix, this.mMatrix, y);
			mat4.scale(this.mMatrix, this.mMatrix, scale);

			// Transform Local Coordinates
			mat4.translate(this.lcMatrix, this.lcMatrix, position);
			mat4.rotateX(this.lcMatrix, this.lcMatrix, x);
			mat4.rotateZ(this.lcMatrix, this.lcMatrix, z);
			mat4.rotateY(this.lcMatrix, this.lcMatrix, y);
			mat4.scale(this.lcMatrix, this.lcMatrix, scale);
		}
		mat3.normalFromMat4(this.mMatrixInv, this.mMatrix);
	};
}
