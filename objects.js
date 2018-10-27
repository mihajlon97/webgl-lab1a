function Pyramid(gl, position = [0, 0.6, -2]) {
    if (Pyramid.shaderProgram === undefined) {
        Pyramid.shaderProgram = initShaderProgram(gl, "vertex-shader", "fragment-shader");
        if (Pyramid.shaderProgram === null) {
            throw new Error('Creating the shader program failed.');
        }
        Pyramid.locations = {
            attribute: {
                vertPosition: gl.getAttribLocation(Pyramid.shaderProgram, "vertPosition"),
                vertColor: gl.getAttribLocation(Pyramid.shaderProgram, "vertColor"),
            },
            uniform: {
                mMatrix: gl.getUniformLocation(Pyramid.shaderProgram, "mMatrix"),
                mMatrixInv: gl.getUniformLocation(Pyramid.shaderProgram, "mMatrixInv"),
                projMatrix: gl.getUniformLocation(Pyramid.shaderProgram, "projMatrix")
            }
        };
        gl.enableVertexAttribArray(Pyramid.locations.attribute.vertPosition);
        gl.enableVertexAttribArray(Pyramid.locations.attribute.vertColor);
    }
    if (Pyramid.buffers === undefined) {
        // Create a buffer with the vertex positions
        // 3 coordinates per vertex, 3 vertices per triangle
        // 2 triangles make up the ground plane, 4 triangles make up the sides
        const pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        let vertices = [-0.5, 0.0, -0.5,
                         0.5, 0.0, -0.5,
                         0.5, 0.0,  0.5,

                        -0.5, 0.0, -0.5,
                         0.5, 0.0,  0.5,
                        -0.5, 0.0,  0.5,

                        -0.5, 0.0, -0.5,
                         0.5, 0.0, -0.5,
                         0.0, 1.0,  0.0,

                         0.5, 0.0, -0.5,
                         0.5, 0.0,  0.5,
                         0.0, 1.0,  0.0,

                         0.5, 0.0,  0.5,
                        -0.5, 0.0,  0.5,
                         0.0, 1.0,  0.0,

                        -0.5, 0.0,  0.5,
                        -0.5, 0.0, -0.5,
                         0.0, 1.0,  0.0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Create a buffer with the vertex colors
        const cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        let colors = [255, 255, 255,
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

        Pyramid.buffers = {
            pBuffer: pBuffer,
            cBuffer: cBuffer,
            pComponents: 3, // number of components per vertex in pBuffer
            cComponents: 3, // number of components per color in cBuffer
        };
    }

    this.position = position;
		this.scale = [0.3, 0.3, 0.3];
		let nr1 = Math.random();
		let nr2 = Math.random();
		let nr3 = Math.random();

    this.rotationX = (nr1 == 0.5) ? 1 : 0;
		this.rotationY = (nr2 == 0.5) ? 1 : 0;
		this.rotationZ = (nr3 == 0.5) ? 1 : 0;
    this.mMatrix = mat4.create();
    this.mMatrixTInv = mat3.create();
		this.selected = true;

    this.draw = function(gl, pMatrix) {

        gl.useProgram(Pyramid.shaderProgram);
        gl.uniformMatrix4fv(Pyramid.locations.uniform.projMatrix, false, pMatrix);
        gl.uniformMatrix4fv(Pyramid.locations.uniform.mMatrix, false, this.mMatrix);
        gl.uniformMatrix3fv(Pyramid.locations.uniform.mMatrixInv, false, this.mMatrixTInv);
        gl.uniform4fv(Pyramid.locations.uniform.uColor, [1.0, 0.0, 0.0, 1.0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.buffers.pBuffer);
        gl.vertexAttribPointer(Pyramid.locations.attribute.vertPosition,
                               Pyramid.buffers.pComponents,
                               gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.buffers.cBuffer);
        gl.vertexAttribPointer(Pyramid.locations.attribute.vertColor,
                               Pyramid.buffers.cComponents,
                               gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 18);
				this.update(0.00, 0.00, 0.00);
    };

    this.update = function(x, y, z, position = this.position, scale = this.scale) {
				this.rotationX += x;
				this.rotationY += y;
				this.rotationZ += z;

				if (!arraysEqual(position, this.position)) {
					this.position = this.position.map(function (num, idx) {
					  return num + position[idx];
					});
				}

				if (!arraysEqual(scale, this.scale)) {
					this.scale = this.scale.map(function (num, idx) {
					  return num * scale[idx];
					});
				}

        // set the current modelwa matrix
        mat4.identity(this.mMatrix);
        mat4.translate(this.mMatrix, this.mMatrix, this.position);
        mat4.rotateY(this.mMatrix, this.mMatrix, this.rotationY);
        mat4.rotateX(this.mMatrix, this.mMatrix, this.rotationX);
				mat4.rotateZ(this.mMatrix, this.mMatrix, this.rotationZ);
				mat4.scale(this.mMatrix, this.mMatrix, this.scale);
        // compute the inverse transpose of the 3x3 submatrix of the model matrix
        mat3.normalFromMat4(this.mMatrixTInv, this.mMatrix);
    };
}
