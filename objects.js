// Pyramid object
// Expected parameter, gl instance and object position
function Pyramid(gl, position = [0, 0.6, -2], pMatrix, wMatrix) {

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
            },
            uniform: {
                mMatrix: gl.getUniformLocation(Pyramid.shaderProgram, "mMatrix"),
                wMatrix: gl.getUniformLocation(Pyramid.shaderProgram, "wMatrix"),
                mMatrixInv: gl.getUniformLocation(Pyramid.shaderProgram, "mMatrixInv"),
                pMatrix: gl.getUniformLocation(Pyramid.shaderProgram, "pMatrix")
            }
        };
        gl.enableVertexAttribArray(Pyramid.locations.attribute.vertPosition);
        gl.enableVertexAttribArray(Pyramid.locations.attribute.vertColor);
    }

    // Buffers
    if (Pyramid.buffers === undefined) {
        // Create a buffer with the vertex positions
        // 3 coordinates per vertex, 3 vertices per triangle
        // 2 triangles make up the ground plane, 4 triangles make up the sides
        const pBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
        let vertices = [-0.5, 0.0, -0.5,
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


        Pyramid.buffers = {
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
    this.position = position;
    this.scale = [0.3, 0.3, 0.3];
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
    this.pMatrix = pMatrix;
    this.wMatrix = wMatrix;
    this.mMatrix = mat4.create();
    this.mMatrixTInv = mat3.create();
    this.selected = false;
    this.global = false;

    // Object draw function
    this.draw = function (gl) {
        gl.useProgram(Pyramid.shaderProgram);
        gl.uniformMatrix4fv(Pyramid.locations.uniform.pMatrix, false, this.pMatrix);
        gl.uniformMatrix4fv(Pyramid.locations.uniform.mMatrix, false, this.mMatrix);
        gl.uniformMatrix4fv(Pyramid.locations.uniform.wMatrix, false, this.wMatrix);
        gl.uniformMatrix3fv(Pyramid.locations.uniform.mMatrixInv, false, this.mMatrixTInv);
        gl.uniform4fv(Pyramid.locations.uniform.uColor, [1.0, 0.0, 0.0, 1.0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.buffers.pBuffer);
        gl.vertexAttribPointer(Pyramid.locations.attribute.vertPosition, Pyramid.buffers.pComponents, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.buffers.cBuffer);
        gl.vertexAttribPointer(Pyramid.locations.attribute.vertColor,
        Pyramid.buffers.cComponents, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 18);
    };


    // Object drawLines function which are displayed as local coordinates in colors R for x, G for y and B for z axis
    this.drawLines = function (gl) {
        gl.useProgram(Pyramid.shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.buffers.lBuffer);
        gl.vertexAttribPointer(Pyramid.locations.attribute.vertPosition, Pyramid.buffers.lBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.buffers.lcBuffer);
        gl.vertexAttribPointer(Pyramid.locations.attribute.vertColor, Pyramid.buffers.lcBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Pyramid.buffers.liBuffer);
        gl.uniformMatrix4fv(Pyramid.locations.uniform.pMatrix, false, this.pMatrix);
        gl.uniformMatrix4fv(Pyramid.locations.uniform.mMatrix, false, this.mMatrix);

        gl.drawElements(gl.LINES, Pyramid.buffers.liBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    };


    // Object update function
    // Expected parameters, x,y and z axis rotators, position vector and scale vector
    this.start = function (x = 0, y = 0, z = 0, position = this.position, scale = this.scale) {
        // Sum for rotation
        this.rotationX += x;
        this.rotationY += y;
        this.rotationZ += z;

        // Sum postion vector with existing position if different
        if (!arraysEqual(position, this.position)) {
            this.position = this.position.map(function (num, idx) {
                return num + position[idx];
            });
        }

        // Sum scale vector with existing scale if different
        if (!arraysEqual(scale, this.scale)) {
            this.scale = this.scale.map(function (num, idx) {
                return num * scale[idx];
            });
        }

        // Apply transformations in order Translate, Rotate, Scale
        mat4.identity(this.mMatrix);

        mat4.translate(this.mMatrix, this.mMatrix, this.position);
        mat4.rotateZ(this.mMatrix, this.mMatrix, this.rotationZ);
        mat4.rotateY(this.mMatrix, this.mMatrix, this.rotationY);
        mat4.rotateX(this.mMatrix, this.mMatrix, this.rotationX);

        mat4.scale(this.mMatrix, this.mMatrix, this.scale);
    };

    this.translate = function (position = this.position) {
        if (this.global){
            if (!arraysEqual(position, this.position)) {
                this.position = this.position.map(function (num, idx) {
                    return num + position[idx];
                });
            }
            // mat4.identity(pMatrix);
            mat4.translate(pMatrix, pMatrix, position);
            this.newpos = position;
        } else {
            mat4.translate(this.mMatrix, this.mMatrix, position);
        }
    }

    this.scaleM = function (scale = this.scale) {
        mat4.scale(this.mMatrix, this.mMatrix, scale);
    }

    this.rotateX = function (x = this.rotationX) {
        this.rotationX += x;
        if (this.global){
            mat4.rotateX(pMatrix, pMatrix, x/10);
        } else {
            mat4.rotateX(this.mMatrix, this.mMatrix, x);
        }
    }

    this.rotateY = function (y = this.rotationY) {
        this.rotationY += y;
        if (this.global){
            mat4.rotateY(pMatrix, pMatrix, y/10);
        } else {
            mat4.rotateY(this.mMatrix, this.mMatrix, y);
        }
    }

    this.rotateZ = function (z = this.rotationZ) {
        this.rotationZ += z;
        if (this.global){
            mat4.rotateZ(pMatrix, pMatrix, z/10);
        } else {
            mat4.rotateZ(this.mMatrix, this.mMatrix, z);
        }
    }
}
