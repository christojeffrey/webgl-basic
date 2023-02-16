let canvas;
let gl;

let vertex_buffer;
let Index_Buffer;
let points = [];
let indexes = [];

function createCanvas(height = 1000, width = 1000) {
  canvas = document.createElement("canvas");
  canvas.id = "canvas";
  canvas.width = width;
  canvas.height = height;
  document.getElementById("root").appendChild(canvas);
  gl = canvas.getContext("webgl");

  canvas.onmousedown = handleMouseDown;
  canvas.onmouseenter = handleMouseHover;
  return document.getElementById("canvas");
}

function handleMouseHover(e) {
  // change cursor to crosshair
  canvas.style.cursor = "crosshair";
}
function handleMouseDown(e) {
  let x = e.clientX;
  let y = e.clientY;
  let rect = e.target.getBoundingClientRect();
  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
  console.log("x", x);
  console.log("y", y);
}
function objectToPixel(vertex_buffer, Index_Buffer) {
  // vertex shader source code
  var vertCode = "attribute vec3 coordinates;" + "void main(void) {" + " gl_Position = vec4(coordinates, 1.0);" + "gl_PointSize = 10.0;" + "}";

  // vertex shader with stroke
  // Create a vertex shader object
  var vertShader = gl.createShader(gl.VERTEX_SHADER);

  // Attach vertex shader source code
  gl.shaderSource(vertShader, vertCode);

  // Compile the vertex shader
  gl.compileShader(vertShader);

  // fragment shader source code
  var fragCode = "void main(void) {" + " gl_FragColor = vec4(5.0, 10.0, 0.0, 1.0);" + "}";

  // Create fragment shader object
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

  // Attach fragment shader source code
  gl.shaderSource(fragShader, fragCode);

  // Compile the fragmentt shader
  gl.compileShader(fragShader);

  // Create a shader program object to store
  // the combined shader program
  var shaderProgram = gl.createProgram();

  // Attach a vertex shader
  gl.attachShader(shaderProgram, vertShader);

  // Attach a fragment shader
  gl.attachShader(shaderProgram, fragShader);

  // Link both programs
  gl.linkProgram(shaderProgram);

  // Use the combined shader program object
  gl.useProgram(shaderProgram);

  /*======== Associating shaders to buffer objects ========*/

  // Bind vertex buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  // Bind index buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);

  // Get the attribute location
  var coord = gl.getAttribLocation(shaderProgram, "coordinates");

  // Point an attribute to the currently bound VBO
  gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);

  // Enable the attribute
  gl.enableVertexAttribArray(coord);
}

function background(r = 128, g = 128, b = 128, a = 1.0) {
  // set color from 0...255 to 0...1
  r /= 255;
  g /= 255;
  b /= 255;

  gl.clearColor(r, g, b, a);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

// point
function point(x, y) {
  // create point in memory
  if (!vertex_buffer) {
    vertex_buffer = gl.createBuffer();
  }
  if (!Index_Buffer) {
    Index_Buffer = gl.createBuffer();
  }
  points = [...points, x, y, 0.0];
  indexes = [...indexes, points.length / 3 - 1];
  console.log("points", points);
  console.log("indexes", indexes);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  //   transform to pixel
  objectToPixel(vertex_buffer, Index_Buffer);

  //   draw
  drawPoint();
}

function drawPoint() {
  // Draw point
  gl.drawArrays(gl.POINTS, 0, points.length / 3);
}

// triangle
function triangle(x1, y1, x2, y2, x3, y3) {
  if (!vertex_buffer) {
    vertex_buffer = gl.createBuffer();
  }
  if (!Index_Buffer) {
    Index_Buffer = gl.createBuffer();
  }
  points = [...points, x1, y1, 0.0, x2, y2, 0.0, x3, y3, 0.0];
  indexes = [...indexes, points.length / 3 - 3, points.length / 3 - 2, points.length / 3 - 1];

  console.log("points", points);
  console.log("indexes", indexes);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  objectToPixel(vertex_buffer, Index_Buffer);
  drawTriangle();
}

function drawTriangle() {
  // Draw triangle
  gl.drawElements(gl.TRIANGLES, indexes.length, gl.UNSIGNED_SHORT, 0);
}

// polygon
function polygon(sides) {
  // sides is an array that contains the x and y coordinates of the polygon
  // example: polygon([[0,0],[100,0],[100,100],[0,100]])
  if (!vertex_buffer) {
    vertex_buffer = gl.createBuffer();
  }
  if (!Index_Buffer) {
    Index_Buffer = gl.createBuffer();
  }
  for (let i = 0; i < sides.length; i++) {
    points = [...points, sides[i][0], sides[i][1], 0.0];
    indexes = [...indexes, points.length / 3 - 1];
  }

  console.log("points", points);
  console.log("indexes", indexes);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  objectToPixel(vertex_buffer, Index_Buffer);
  drawPolygon();
}
function drawPolygon() {
  // Draw polygon using draw array
  gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length / 3);
}

// line
function line(x1, y1, x2, y2) {
  if (!vertex_buffer) {
    vertex_buffer = gl.createBuffer();
  }
  if (!Index_Buffer) {
    Index_Buffer = gl.createBuffer();
  }
  points = [...points, x1, y1, 0.0, x2, y2, 0.0];
  indexes = [...indexes, points.length / 3 - 2, points.length / 3 - 1];

  console.log("points", points);
  console.log("indexes", indexes);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  objectToPixel(vertex_buffer, Index_Buffer);
  drawLine();
}
function drawLine() {
  // Draw line
  // gl.drawElements(gl.LINES, indexes.length, gl.UNSIGNED_SHORT, 0);
  gl.drawArrays(gl.LINES, 0, points.length / 3);
}

function triangulate(vertices) {
  let triangles = [];

  while (vertices.length > 2) {
    // Find an "ear" of the polygon
    for (let i = 0; i < vertices.length; i++) {
      let prev = i == 0 ? vertices.length - 1 : i - 1;
      let next = i == vertices.length - 1 ? 0 : i + 1;

      if (isEar(prev, i, next, vertices)) {
        // Create a triangle from the ear
        triangles.push([vertices[prev], vertices[i], vertices[next]]);
        // Remove the ear vertex from the polygon
        vertices.splice(i, 1);
        break;
      }
    }
  }

  return triangles;
}

function isEar(i, j, k, vertices) {
  // Check if the angle at vertex j is concave
  let angle = getAngle(vertices[i], vertices[j], vertices[k]);
  if (angle > 0) {
    return false;
  }

  // Check if any other vertex is inside the triangle
  for (let m = 0; m < vertices.length; m++) {
    if (m != i && m != j && m != k) {
      if (isPointInTriangle(vertices[m], vertices[i], vertices[j], vertices[k])) {
        return false;
      }
    }
  }

  return true;
}

function getAngle(p1, p2, p3) {
  let v1 = [p1[0] - p2[0], p1[1] - p2[1]];
  let v2 = [p3[0] - p2[0], p3[1] - p2[1]];
  let dot = v1[0] * v2[0] + v1[1] * v2[1];
  let det = v1[0] * v2[1] - v1[1] * v2[0];
  return Math.atan2(det, dot);
}

function isPointInTriangle(p, p1, p2, p3) {
  let a = 0.5 * (-p2[1] * p3[0] + p1[1] * (-p2[0] + p3[0]) + p1[0] * (p2[1] - p3[1]) + p2[0] * p3[1]);
  let sign = a < 0 ? -1 : 1;
  let s = (p1[1] * p3[0] - p1[0] * p3[1] + (p3[1] - p1[1]) * p[0] + (p1[0] - p3[0]) * p[1]) * sign;
  let t = (p1[0] * p2[1] - p1[1] * p2[0] + (p1[1] - p2[1]) * p[0] + (p2[0] - p1[0]) * p[1]) * sign;

  return s > 0 && t > 0 && s + t < 2 * a * sign;
}

export { createCanvas, point, background, triangle, polygon, line, triangulate };
