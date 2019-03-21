// Global object
// Expected parameter, gl instance and object position
function Global(gl, position = [0, 0, 0]) {

	// Shader program
	if (Global.shaderProgram === undefined) {
		Global.shaderProgram = initShaderProgram(gl, "vertex-shader", "fragment-shader");
		if (Global.shaderProgram === null) {
			throw new Error('Creating the shader program failed.');
		}
		Global.locations = {
			attribute: {
				vertPosition: gl.getAttribLocation(Global.shaderProgram, "vertPosition"),
				vertColor: gl.getAttribLocation(Global.shaderProgram, "vertColor"),
			},
			uniform: {
				mMatrix: gl.getUniformLocation(Global.shaderProgram, "mMatrix"),
				wMatrix: gl.getUniformLocation(Global.shaderProgram, "wMatrix"),
				vMatrix: gl.getUniformLocation(Global.shaderProgram, "vMatrix"),
				mMatrixInv: gl.getUniformLocation(Global.shaderProgram, "mMatrixInv"),
				pMatrix: gl.getUniformLocation(Global.shaderProgram, "pMatrix")
			}
		};
		gl.enableVertexAttribArray(Global.locations.attribute.vertPosition);
		gl.enableVertexAttribArray(Global.locations.attribute.vertColor);
	}

	// Buffers
	if (Global.buffers === undefined) {
		// Create a buffer with the vertex positions
		// 3 coordinates per vertex, 3 vertices per triangle
		// 2 triangles make up the ground plane, 4 triangles make up the sides
		const pBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
		let vertices = [
			0.0, 0.0, 0.0,
			0.0, 0.0, 0.0,
			0.0, 0.0, 0.0,

			0.0, 0.0, 0.0,
			0.0, 0.0, 0.0,
			0.0, 0.0, 0.0,

			0.0, 0.0, 0.0,
			0.0, 0.0, 0.0,
			0.0, 0.0, 0.0,

			0.0, 0.0, 0.0,
			0.0, 0.0, 0.0,
			0.0, 0.0, 0.0,

			0.0, 0.0, 0.0,
			0.0, 0.0, 0.0,
			0.0, 0.0, 0.0,

			0.0, 0.0, 0.5,
			0.0, 0.0, 0.0,
			0.0, 0.0, 0.0];
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
			0.0, 10.1, 0.0,
			0.0, -10.1, 0.0,

			10.1, 0.0, 0.0,
			-10.1, 0.0, 0.0,

			0.0, 0.0, 10.1,
			0.0, 0.0, -10.1
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


		Global.buffers = {
			pBuffer: pBuffer,
			cBuffer: cBuffer,
			lBuffer: lBuffer,
			liBuffer: liBuffer,
			lcBuffer: lcBuffer,
			pComponents: 3,
			cComponents: 3,
		};
	}

	// Object Variables
	this.lcPosition = position;

	this.mMatrix = mat4.create();
	this.lcMatrix = mat4.create();
	this.mMatrixTInv = mat3.create();

	// Object draw function
	this.draw = function (gl, pMatrix, vMatrix) {
		gl.useProgram(Global.shaderProgram);
		gl.uniformMatrix4fv(Global.locations.uniform.pMatrix, false, pMatrix);
		gl.uniformMatrix4fv(Global.locations.uniform.mMatrix, false, this.mMatrix);
		gl.uniformMatrix4fv(Global.locations.uniform.wMatrix, false, wMatrix);
		gl.uniformMatrix4fv(Global.locations.uniform.vMatrix, false, vMatrix);
		gl.uniformMatrix3fv(Global.locations.uniform.mMatrixInv, false, this.mMatrixTInv);
		gl.uniform4fv(Global.locations.uniform.uColor, [1.0, 0.0, 0.0, 1.0]);

		gl.bindBuffer(gl.ARRAY_BUFFER, Global.buffers.pBuffer);
		gl.vertexAttribPointer(Global.locations.attribute.vertPosition, Global.buffers.pComponents, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, Global.buffers.cBuffer);
		gl.vertexAttribPointer(Global.locations.attribute.vertColor,
			Global.buffers.cComponents, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 18);

		this.drawLines(gl, pMatrix);
	};


	// Object drawLines function which are displayed as local coordinates in colors R for x, G for y and B for z axis
	this.drawLines = function (gl, pMatrix) {
		gl.useProgram(Global.shaderProgram);

		gl.bindBuffer(gl.ARRAY_BUFFER, Global.buffers.lBuffer);
		gl.vertexAttribPointer(Global.locations.attribute.vertPosition, Global.buffers.lBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, Global.buffers.lcBuffer);
		gl.vertexAttribPointer(Global.locations.attribute.vertColor, Global.buffers.lcBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Global.buffers.liBuffer);
		gl.uniformMatrix4fv(Global.locations.uniform.pMatrix, false, pMatrix);
		gl.uniformMatrix4fv(Global.locations.uniform.mMatrix, false, this.lcMatrix);

		gl.drawElements(gl.LINES, Global.buffers.liBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	};

	this.update = function () {
		return false;
	};

	this.start = function () {
		this.position = this.lcPosition
		mat4.translate(this.mMatrix, this.mMatrix, this.lcPosition);
		mat4.translate(this.lcMatrix, this.lcMatrix, this.lcPosition);
	};
}
