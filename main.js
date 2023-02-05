// create a dot using webgl inside id canvas
var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl");
var program = gl.createProgram();
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
  vertexShader,
  `

attribute vec2 position;    
void main() {
    gl_Position = vec4(position, 0, 1);
}
`
);
gl.shaderSource(
  fragmentShader,
  `
precision mediump float;
void main() {
    gl_FragColor = vec4(1, 0, 0, 1);
}
`
);
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);
var positionLocation = gl.getAttribLocation(program, "position");
var buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 0.5, 0.7, 0]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
gl.drawArrays(gl.TRIANGLES, 0, 3);
