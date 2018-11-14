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
            },
            uniform: {
                mMatrix: gl.getUniformLocation(Pyramid.shaderProgram, "mMatrix"),
                wMatrix: gl.getUniformLocation(Pyramid.shaderProgram, "wMatrix"),
                vMatrix: gl.getUniformLocation(Pyramid.shaderProgram, "vMatrix"),
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
    this.lcPosition = position;
    this.scale = [1, 1, 1];
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;

    this.mMatrix = mat4.create();
    this.lcMatrix = mat4.create();
    this.mMatrixTInv = mat3.create();
    this.selected = false;
    this.global = false;

    // Object draw function
    this.draw = function (gl, pMatrix, vMatrix) {
        gl.useProgram(Pyramid.shaderProgram);
        gl.uniformMatrix4fv(Pyramid.locations.uniform.pMatrix, false, pMatrix);
        gl.uniformMatrix4fv(Pyramid.locations.uniform.mMatrix, false, this.mMatrix);
        gl.uniformMatrix4fv(Pyramid.locations.uniform.wMatrix, false, wMatrix);
        gl.uniformMatrix4fv(Pyramid.locations.uniform.vMatrix, false, vMatrix);
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
    this.drawLines = function (gl, pMatrix) {
        gl.useProgram(Pyramid.shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.buffers.lBuffer);
        gl.vertexAttribPointer(Pyramid.locations.attribute.vertPosition, Pyramid.buffers.lBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, Pyramid.buffers.lcBuffer);
        gl.vertexAttribPointer(Pyramid.locations.attribute.vertColor, Pyramid.buffers.lcBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Pyramid.buffers.liBuffer);
        gl.uniformMatrix4fv(Pyramid.locations.uniform.pMatrix, false, pMatrix);
        gl.uniformMatrix4fv(Pyramid.locations.uniform.mMatrix, false, this.lcMatrix);

        gl.drawElements(gl.LINES, Pyramid.buffers.liBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    };

    this.start = function () {
        this.position = this.lcPosition
        mat4.translate(this.mMatrix, this.mMatrix, this.lcPosition);
        mat4.translate(this.lcMatrix, this.lcMatrix, this.lcPosition);
    };

    this.update = function(x,y,z, position = [0,0,0], scale = [1,1,1]) {
        this.rotationX += x;
        this.rotationY += y;
        this.rotationZ += z;
        console.log('X:', x, 'Y:', y, 'Z:', z);

        this.lcPosition = this.lcPosition.map(function (num, idx) {
            return num + position[idx];
        });

        this.scale = this.scale.map(function (num, idx) {
            return num * scale[idx];
        });

        if (this.global) {
            console.log('GLOBAL');
            mat4.identity(this.mMatrix);
            mat4.rotateX(this.mMatrix, this.mMatrix, this.rotationX);
            mat4.rotateZ(this.mMatrix, this.mMatrix, this.rotationZ);
            mat4.rotateY(this.mMatrix, this.mMatrix, this.rotationY);
            mat4.translate(this.mMatrix, this.mMatrix, this.lcPosition);
            mat4.identity(this.lcMatrix);
            mat4.multiply(this.lcMatrix, this.lcMatrix, this.mMatrix);


            /*
            mat4.identity(this.lcMatrix);
            mat4.rotateX(this.lcMatrix, this.lcMatrix, this.rotationX);
            mat4.rotateZ(this.lcMatrix, this.lcMatrix, this.rotationZ);
            mat4.rotateY(this.lcMatrix, this.lcMatrix, this.rotationY);
            mat4.translate(this.lcMatrix, this.lcMatrix, this.lcPosition);
            mat4.scale(this.lcMatrix, this.lcMatrix, this.scale);
            this.hehe();
            */
        } else {
            mat4.translate(this.lcMatrix, this.lcMatrix, position);
            mat4.rotateX(this.lcMatrix, this.lcMatrix, x);
            mat4.rotateZ(this.lcMatrix, this.lcMatrix, z);
            mat4.rotateY(this.lcMatrix, this.lcMatrix, y);
            mat4.scale(this.lcMatrix, this.lcMatrix, scale)
            this.hehe();
        }
    };

    this.hehe = function(){
        mat4.identity(this.mMatrix);
        mat4.multiply(this.mMatrix, this.mMatrix, this.lcMatrix);
    }

    this.translate = function (position = this.position) {
        if (this.global){
            console.log('GLOBAL');
            mat4.translate(this.lcMatrix, this.lcMatrix, position);
            this.hehe();
        } else {
            mat4.translate(this.lcMatrix, this.lcMatrix, position);
            this.hehe();
        }
    }

    this.scaleM = function (scale = this.scale) {
        mat4.scale(this.mMatrix, this.mMatrix, scale);
    }

    this.rotateX = function (x) {
        console.log('ROTATION X');
        if (this.global){
            console.log('GLOBAL');
            this.rotationX += x;
            mat4.identity(this.mMatrix);
            mat4.rotateX(this.mMatrix, this.mMatrix, this.rotationX);
            mat4.rotateY(this.mMatrix, this.mMatrix, this.rotationY);
            mat4.rotateZ(this.mMatrix, this.mMatrix, this.rotationY);
            mat4.translate(this.mMatrix, this.mMatrix, this.position);
            mat4.scale(this.mMatrix, this.mMatrix, this.scale);
        } else {
            console.log('LOCAL');
            mat4.identity(this.mMatrix);
            mat4.translate(this.mMatrix, this.mMatrix, this.lcPosition);
            mat4.rotateX(this.mMatrix, this.mMatrix, x);
        }
    }

    this.rotateY = function (y) {
        if (this.global){
            this.rotationY += y;
            mat4.identity(this.mMatrix);
            mat4.translate(this.mMatrix, this.mMatrix, this.position);
            mat4.rotateX(this.mMatrix, this.mMatrix, this.rotationX);
            mat4.rotateY(this.mMatrix, this.mMatrix, this.rotationY);
            mat4.scale(this.mMatrix, this.mMatrix, this.scale);
        } else {
            this.rotationY += y;
            mat4.identity(this.mMatrix);
            mat4.translate(this.mMatrix, this.mMatrix, this.position);
            mat4.rotateX(this.mMatrix, this.mMatrix, this.rotationX);
            mat4.rotateY(this.mMatrix, this.mMatrix, this.rotationY);
            mat4.scale(this.mMatrix, this.mMatrix, this.scale);
        }
    }

    this.rotateZ = function (z) {
        if (this.global){
            this.rotationZ += z;
            mat4.identity(this.mMatrix);
            mat4.translate(this.mMatrix, this.mMatrix, this.position);
            mat4.rotateX(this.mMatrix, this.mMatrix, this.rotationX);
            mat4.rotateY(this.mMatrix, this.mMatrix, this.rotationY);
            mat4.rotateZ(this.mMatrix, this.mMatrix, this.rotationZ);
            mat4.scale(this.mMatrix, this.mMatrix, this.scale);
        } else {
            this.rotationZ += z;
            mat4.rotateZ(this.mMatrix, this.mMatrix, z);
            mat4.scale(this.mMatrix, this.mMatrix, this.scale);
        }
    }
}
