import { triangulate, convexHull, removeUnusedPoints } from "./polygonHelper.js";

// global variables
let canvas;
let gl;

let vertex_buffer;
let Index_Buffer;
let points = [];
let indexes = [];

// list of objects
let drawnItems = [];

// exposed variables
let background = [];
let objectToBeDrawn = [];

function createCanvas(height = 1000, width = 1000) {
  canvas = document.createElement("canvas");
  canvas.id = "canvas";
  canvas.width = width;
  canvas.height = height;
  document.getElementById("root").appendChild(canvas);
  gl = canvas.getContext("webgl");

  return document.getElementById("canvas");
}

function objectToPixel(vertex_buffer, Index_Buffer, r = 0, g = 0, b = 0, a = 1.0) {
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
  var fragCode = "void main(void) {" + " gl_FragColor = vec4(" + r + ", " + g + ", " + b + ", " + a + ");" + "}";

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

function drawBackground() {
  // set color from 0...255 to 0...1
  let r = background[0] / 255;
  let g = background[1] / 255;
  let b = background[2] / 255;
  let a = background[3];

  console.log("background", r, g, b, a);

  gl.clearColor(r, g, b, a);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

// point
function point(x, y, r = 0, g = 0, b = 0, a = 1) {
  // create point in memory
  if (!vertex_buffer) {
    vertex_buffer = gl.createBuffer();
  }
  if (!Index_Buffer) {
    Index_Buffer = gl.createBuffer();
  }
  points = [...points, x, y, 0.0];
  indexes = [...indexes, points.length / 3 - 1];
  // console.log("points", points);
  // console.log("indexes", indexes);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  //   transform to pixel
  objectToPixel(vertex_buffer, Index_Buffer, r, g, b, a);

  //   draw
  drawPoint();
}

function drawPoint() {
  // Draw point
  console.log("draw point");
  let offset = setOffset();
  console.log("offset", offset);
  gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, offset);
}

// triangle
function triangle([x1, y1, x2, y2, x3, y3], lined = false) {
  if (!vertex_buffer) {
    vertex_buffer = gl.createBuffer();
  }
  if (!Index_Buffer) {
    Index_Buffer = gl.createBuffer();
  }
  points = [...points, x1, y1, 0.0, x2, y2, 0.0, x3, y3, 0.0];
  indexes = [...indexes, points.length / 3 - 3, points.length / 3 - 2, points.length / 3 - 1];

  // console.log("points", points);
  // console.log("indexes", indexes);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  objectToPixel(vertex_buffer, Index_Buffer);

  if (lined) {
    drawTriangle();
  } else {
    drawTriangle();
  }
}

function drawTriangle() {
  // Draw triangle
  let offset = setOffset();
  gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, offset);
}

// polygon
function polygon(points) {
  // filter with convex hull
  points = convexHull(points);
  points = removeUnusedPoints(points);

  // for each point, draw a point
  // for (let i = 0; i < points.length; i++) {
  //   point(points[i][0], points[i][1]);
  // }
  let triangles = triangulate(points);
  for (let i = 0; i < triangles.length; i++) {
    // flatten
    triangles[i] = triangles[i].flat();
    console.log("drawn", triangles[i]);
    // if (i == 0) continue;
    triangle(triangles[i], false);
  }
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

function setOffset() {
  let offset = 0;
  console.log("calculating offset..", drawnItems.length);
  for (let i = 0; i < drawnItems.length; i++) {
    console.log("drawnItems[i].type", drawnItems[i].type);
    if (drawnItems[i].type == "point") {
      offset += 2;
    }
    if (drawnItems[i].type == "line") {
      offset += 4;
    }
  }
  return offset;
}

function drawLine() {
  // Draw line
  // gl.drawElements({ mode: gl.LINES, count: indexes.length, type: gl.UNSIGNED_SHORT, offset: 0 });
  // draw the fourth and the fifth point, which is the line
  let offset = setOffset();
  console.log("offset", offset);
  gl.drawElements(gl.LINES, 2, gl.UNSIGNED_SHORT, offset);
}

function rerender() {
  console.log("======================================");
  drawBackground();

  // clear the canvas
  drawnItems = [];
  points = [];
  indexes = [];

  // draw based on objectToBeDrawn
  for (let i = 0; i < objectToBeDrawn.length; i++) {
    console.log("drawing item", objectToBeDrawn[i]);
    console.log("points", points);
    console.log("indexes", indexes);
    let item = objectToBeDrawn[i];
    if (item.type == "point") {
      point(item.x, item.y, item.color.r, item.color.g, item.color.b, item.color.a);
    } else if (item.type == "line") {
      line(item.x1, item.y1, item.x2, item.y2);
    } else if (item.type == "triangle") {
      triangle(item.x1, item.y1, item.x2, item.y2, item.x3, item.y3);
    }
    drawnItems.push(item);
  }
}

export { rerender, createCanvas, objectToBeDrawn, background };
