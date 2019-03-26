// Sphere object
// Expected parameter, gl instance and object position
function Sphere(gl, position = [0, 0, 0]) {

	// Shader program
	if (Sphere.shaderProgram === undefined) {
		Sphere.shaderProgram = initShaderProgram(gl, "vertex-shader", "fragment-shader");
		if (Sphere.shaderProgram === null) {
			throw new Error('Creating the shader program failed.');
		}
		Sphere.locations = {
			attribute: {
				vertPosition: gl.getAttribLocation(Sphere.shaderProgram, "vertPosition"),
				vertColor: gl.getAttribLocation(Sphere.shaderProgram, "vertColor"),
			},
			uniform: {
				mMatrix: gl.getUniformLocation(Sphere.shaderProgram, "mMatrix"),
				wMatrix: gl.getUniformLocation(Sphere.shaderProgram, "wMatrix"),
				vMatrix: gl.getUniformLocation(Sphere.shaderProgram, "vMatrix"),
				mMatrixInv: gl.getUniformLocation(Sphere.shaderProgram, "mMatrixInv"),
				pMatrix: gl.getUniformLocation(Sphere.shaderProgram, "pMatrix")
			}
		};
		gl.enableVertexAttribArray(Sphere.locations.attribute.vertPosition);
		gl.enableVertexAttribArray(Sphere.locations.attribute.vertColor);
	}

	// Buffers
	if (Sphere.buffers === undefined) {
		// Create a buffer with the vertex positions
		// 3 coordinates per vertex, 3 vertices per triangle
		// 2 triangles make up the ground plane, 4 triangles make up the sides
		const pBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);


		// Position vertices
		let limit = 12;
		let i, hi, si, ci;
		let j, hj, sj, cj;
		let p1, p2;

		let vertices = [];
		for (let j = 0; j <= limit; j++) {
			hj = j * Math.PI / limit;
			sj = Math.sin(hj);
			cj = Math.cos(hj);
			for (let i = 0; i <= limit; i++) {
				hi = i * 2 * Math.PI / limit;
				si = Math.sin(hi);
				ci = Math.cos(hi);

				// 0.77 to minimize the sphere
				vertices.push(si * sj * 0.77);  // X
				vertices.push(cj * 0.77);       // Y
				vertices.push(ci * sj * 0.77);  // Z
			}
		}

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		pBuffer.itemSize = 3;
		pBuffer.numItems = vertices.length;


		// Indices
		let indices = []
		let iBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
		for (j = 0; j < limit; j++) {
			for (i = 0; i < limit; i++) {
				p1 = j * (limit + 1) + i;
				p2 = p1 + (limit + 1);

				indices.push(p1);
				indices.push(p2);
				indices.push(p1 + 1);

				indices.push(p1 + 1);
				indices.push(p2);
				indices.push(p2 + 1);
			}
		}

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		iBuffer.itemSize = 3;
		iBuffer.numItems = indices.length;


		// Color
		let cBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		let colors = [];

		for (let i = 0; i <= limit; i++) {
			for (let j = 0; j <= limit; j++) {
				colors.push(0);
				colors.push(0);
				colors.push(0.99);
			}
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		cBuffer.itemSize = 3;
		cBuffer.numitems = colors.length;


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

		let lineIndices = [
			0, 1,
			2, 3,
			4, 5
		];
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lineIndices), gl.STATIC_DRAW);
		liBuffer.itemSize = 1;
		liBuffer.numItems = 6;

		const lcBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, lcBuffer);

		let lineColors = [
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


		Sphere.buffers = {
			pBuffer: pBuffer,
			cBuffer: cBuffer,
			lBuffer: lBuffer,
			iBuffer: iBuffer,
			liBuffer: liBuffer,
			lcBuffer: lcBuffer,
			pComponents: 3,
			cComponents: 3,
		};
	}

	// Object Variables
	this.lcPosition = position;
	this.scale = [1, 1, 1];

	this.mMatrix = mat4.create();
	this.lcMatrix = mat4.create();
	this.mMatrixTInv = mat3.create();
	this.selected = false;
	this.global = false;

	// Object draw function
	this.draw = function (gl, pMatrix, vMatrix) {
		gl.useProgram(Sphere.shaderProgram);
		gl.uniformMatrix4fv(Sphere.locations.uniform.pMatrix, false, pMatrix);
		gl.uniformMatrix4fv(Sphere.locations.uniform.mMatrix, false, this.mMatrix);
		gl.uniformMatrix4fv(Sphere.locations.uniform.wMatrix, false, wMatrix);
		gl.uniformMatrix4fv(Sphere.locations.uniform.vMatrix, false, vMatrix);
		gl.uniformMatrix3fv(Sphere.locations.uniform.mMatrixInv, false, this.mMatrixTInv);
		gl.uniform4fv(Sphere.locations.uniform.uColor, [1.0, 0.0, 0.0, 1.0]);

		gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.buffers.pBuffer);
		gl.vertexAttribPointer(Sphere.locations.attribute.vertPosition, Sphere.buffers.pComponents, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.buffers.cBuffer);
		gl.vertexAttribPointer(Sphere.locations.attribute.vertColor,
			Sphere.buffers.cComponents, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Sphere.buffers.iBuffer);

		gl.drawArrays(gl.TRIANGLES, 0, 18);
		gl.drawElements(gl.TRIANGLES, Sphere.buffers.iBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	};


	// Object drawLines function which are displayed as local coordinates in colors R for x, G for y and B for z axis
	this.drawLines = function (gl, pMatrix) {
		gl.useProgram(Sphere.shaderProgram);

		gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.buffers.lBuffer);
		gl.vertexAttribPointer(Sphere.locations.attribute.vertPosition, Sphere.buffers.lBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.buffers.lcBuffer);
		gl.vertexAttribPointer(Sphere.locations.attribute.vertColor, Sphere.buffers.lcBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Sphere.buffers.liBuffer);
		gl.uniformMatrix4fv(Sphere.locations.uniform.pMatrix, false, pMatrix);
		gl.uniformMatrix4fv(Sphere.locations.uniform.mMatrix, false, this.lcMatrix);

		gl.drawElements(gl.LINES, Sphere.buffers.liBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	};

	this.start = function () {
		mat4.translate(this.mMatrix, this.mMatrix, this.lcPosition);
		mat4.translate(this.lcMatrix, this.lcMatrix, this.lcPosition);
	};

	this.update = function (x, y, z, position = [0, 0, 0], scale = [1, 1, 1]) {
		// Global transformations
		if (this.global) {
			mat4.identity(this.mMatrix);
			mat4.scale(this.mMatrix, this.mMatrix, scale);
			mat4.rotateX(this.mMatrix, this.mMatrix, x);
			mat4.rotateY(this.mMatrix, this.mMatrix, y);
			mat4.rotateZ(this.mMatrix, this.mMatrix, z);
			mat4.translate(this.mMatrix, this.mMatrix, position);
			mat4.multiply(this.mMatrix, this.mMatrix, this.lcMatrix);
			mat4.identity(this.lcMatrix);
			mat4.multiply(this.lcMatrix, this.lcMatrix, this.mMatrix);
		}
		// Local transformations
		else {
			mat4.translate(this.mMatrix, this.mMatrix, position);
			mat4.rotateX(this.mMatrix, this.mMatrix, x);
			mat4.rotateZ(this.mMatrix, this.mMatrix, z);
			mat4.rotateY(this.mMatrix, this.mMatrix, y);
			mat4.scale(this.mMatrix, this.mMatrix, scale);
			mat4.translate(this.lcMatrix, this.lcMatrix, position);
			mat4.rotateX(this.lcMatrix, this.lcMatrix, x);
			mat4.rotateZ(this.lcMatrix, this.lcMatrix, z);
			mat4.rotateY(this.lcMatrix, this.lcMatrix, y);
			mat4.scale(this.lcMatrix, this.lcMatrix, scale);
		}
	};
}
