// Create a shader from the element with id "source_id"
function loadShader(gl, source_id) {
    var shaderScript = document.getElementById(source_id);
    if (!shaderScript) {
        return null;
    }

    // Create a shader of the type specified by the source-element
    var shader;
    if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else {
        return null;
    }

    // Compile the shader, alert if compilation failed
    gl.shaderSource(shader, shaderScript.text);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Failed to compile shader: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/*
 * Create a shader program from a vertex shader (html-element "vs_id")
 * and a fragment shader (html-element "fs_id".
 */
function initShaderProgram(gl, vs_id, fs_id) {
    var vShader = loadShader(gl, vs_id);
    var fShader = loadShader(gl, fs_id);
    if (!vShader) {
        alert("Failed to load vertex shader " + vs_id);
        return null;
    }
    if (!fShader) {
        alert("Failed to load fragment shader " + fs_id);
        return null;
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vShader);
    gl.attachShader(shaderProgram, fShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialize shaders:" + gl.getProgramInfoLog(shaderProgram));
        gl.deleteProgram(shaderProgram);
        gl.deleteShader(vShader);
        gl.deleteShader(fShader);
        return null;
    }
    return shaderProgram;
}
