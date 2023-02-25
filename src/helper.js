import { triangulate, convexHull, removeUnusedPoints } from "./polygonHelper.js";
import { colorHexToRgb } from "./utils.js";
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
let background = { colorHex: "#FFFFFF", a: 0 };
let objectToBeDrawn = [];
let objectBeingDrawn = {};

function createCanvas(height = 1000, width = 1000) {
  canvas = document.createElement("canvas");
  canvas.id = "canvas";
  canvas.width = width;
  canvas.height = height;
  document.getElementById("root").appendChild(canvas);
  gl = canvas.getContext("webgl");

  return document.getElementById("canvas");
}

// rasterizer
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
    if (drawnItems[i].type == "triangle") {
      // for each non null x1, x2, x3, y1, y2, y3, add 1
      let count = 0;
      if (drawnItems[i].x1 != null) {
        count++;
      }
      if (drawnItems[i].x2 != null) {
        count++;
      }
      if (drawnItems[i].x3 != null) {
        count++;
      }

      if (drawnItems[i].y1 != null) {
        count++;
      }
      if (drawnItems[i].y2 != null) {
        count++;
      }
      if (drawnItems[i].y3 != null) {
        count++;
      }
      offset += count;
    }
    if (drawnItems[i].type == "rectangle") {
      let count = 0;
      if (drawnItems[i].x1 != null) {
        count++;
      }
      if (drawnItems[i].x2 != null) {
        count++;
      }
      if (drawnItems[i].x3 != null) {
        count++;
      }
      if (drawnItems[i].x4 != null) {
        count++;
      }

      if (drawnItems[i].y1 != null) {
        count++;
      }
      if (drawnItems[i].y2 != null) {
        count++;
      }
      if (drawnItems[i].y3 != null) {
        count++;
      }
      if (drawnItems[i].y4 != null) {
        count++;
      }

      offset += count;
    }

    if (drawnItems[i].type == "polygon") {
      // an array of triangles
      for (let j = 0; j < drawnItems[i].triangles.length; j++) {
        // consists of array of 3 points
        offset += 6;
      }
    }
  }
  console.log("calculated offset", offset);
  return offset;
}

function objectToPixel(vertex_buffer, Index_Buffer, colorHex = "#000000") {
  const { r, g, b } = colorHexToRgb(colorHex);
  const a = 1;
  const pointSize = 10;
  // vertex shader source code

  var vertCode = `
  attribute vec3 coordinates;
  void main(void) {
    gl_Position = vec4(coordinates, 1.0);
    gl_PointSize = ${pointSize}.0;
        
  }`;

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

// background
function drawBackground() {
  // set color from 0...255 to 0...1
  const { r, g, b } = colorHexToRgb(background.colorHex);
  const a = 0.0;

  gl.clearColor(r, g, b, a);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

// point
function point(x, y, colorHex) {
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
  objectToPixel(vertex_buffer, Index_Buffer, colorHex);

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
function triangle([x1, y1, x2, y2, x3, y3], colorHex) {
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

  objectToPixel(vertex_buffer, Index_Buffer, colorHex);

  drawTriangle();
}

function drawTriangle() {
  // Draw triangle
  let offset = setOffset();
  console.log("drawing triangle with offset", offset, "and length", 3, "and type", "UNSIGNED_SHORT");
  gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, offset);

  // draw point at the triangles' vertices
  gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, offset);
  gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, offset + 2);
  gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, offset + 4);
}

function rectangle([x1, y1, x2, y2, x3, y3, x4, y4], colorHex) {
  console.log("Rectangle is creating")
  console.log({
    "x1": x1,
    "y1": y1,
    "x2": x2,
    "y2": y2,
    "x3": x3,
    "y3": y3,
    "x4": x4,
    "y4": y4,
  })

  if (!vertex_buffer) {
    vertex_buffer = gl.createBuffer();
  }
  if (!Index_Buffer) {
    Index_Buffer = gl.createBuffer();
  }

  // First Triangle
  points = [...points, x1, y1, 0.0, x2, y2, 0.0, x3, y3, 0.0, x4, y4, 0.0];
  indexes = [...indexes, points.length / 3 - 4, points.length / 3 -3, points.length / 3 - 2, points.length / 3 - 1];

  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  objectToPixel(vertex_buffer, Index_Buffer, colorHex);

  drawRectangle();
  
  // if (!vertex_buffer) {
  //   vertex_buffer = gl.createBuffer();
  // }
  // if (!Index_Buffer) {
  //   Index_Buffer = gl.createBuffer();
  // }

  // points = [...points, x1, y1, 0.0, x3, y3, 0.0, x4, y4, 0.0];
  // indexes = [...indexes, points.length / 3 -3, points.length / 3 - 2, points.length / 3 - 1];

  // gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  // gl.bindBuffer(gl.ARRAY_BUFFER, null)

  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
  // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // objectToPixel(vertex_buffer, Index_Buffer, colorHex);
}

function drawRectangle() {
  // Draw rectangle
  let offset = setOffset();
  console.log("drawing rectangle with offset", offset, "and length", 4, "and type");
  gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, offset);

  // draw point at the rectangles' vertices
  gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, offset);
  gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, offset + 2);
  gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, offset + 4);
  gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, offset + 6);
}

// polygon
function polygon(triangles, colorHex) {
  // setup temporary drawnItems.
  // only need to do this to polygon, since it's created using multiple triangles. which made the offset changes while it is being drawn.
  drawnItems.push({
    type: "polygon",
    triangles: [],
  });

  // draw many triangles
  let drawnTriangles = [];
  for (let i = 0; i < triangles.length; i++) {
    // flatten
    let toBeDrawn = triangles[i].flat();
    let x1 = toBeDrawn[0];
    let y1 = toBeDrawn[1];
    let x2 = toBeDrawn[2];
    let y2 = toBeDrawn[3];
    let x3 = toBeDrawn[4];
    let y3 = toBeDrawn[5];

    // if (i == 0) continue;
    if (!vertex_buffer) {
      vertex_buffer = gl.createBuffer();
    }
    if (!Index_Buffer) {
      Index_Buffer = gl.createBuffer();
    }
    points = [...points, x1, y1, 0.0, x2, y2, 0.0, x3, y3, 0.0];
    indexes = [...indexes, points.length / 3 - 3, points.length / 3 - 2, points.length / 3 - 1];

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    objectToPixel(vertex_buffer, Index_Buffer, colorHex);

    drawTriangle();

    // update drawnItems
    drawnTriangles.push(triangles[i]);
    drawnItems.pop();
    drawnItems.push({
      type: "polygon",
      triangles: drawnTriangles,
    });
  }
  drawnItems.pop();
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
  // gl.drawElements({ mode: gl.LINES, count: indexes.length, type: gl.UNSIGNED_SHORT, offset: 0 });
  // draw the fourth and the fifth point, which is the line
  let offset = setOffset();
  console.log("offset", offset);
  gl.drawElements(gl.LINES, 2, gl.UNSIGNED_SHORT, offset);
  // draw point at the start and end of the line
  gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, offset);
  gl.drawElements(gl.POINTS, 1, gl.UNSIGNED_SHORT, offset + 2);
}

// drawing helper
function finishDrawing() {
  // update objectToBeDrawn, objectBeingDrawn
  console.log("Draw Finished")
  if (objectBeingDrawn) {
    objectToBeDrawn.push(objectBeingDrawn);
    objectBeingDrawn = {};
  }
}

function drawObject(object) {
  if (object.type == "point") {
    point(object.x, object.y, object.colorHex);
  } else if (object.type == "line") {
    line(object.x1, object.y1, object.x2, object.y2);
  } else if (object.type == "triangle") {
    // to handle animation, if x3, y3 is not defined, draw a line instead
    if (object.x3 == undefined || object.y3 == undefined) {
      line(object.x1, object.y1, object.x2, object.y2);
    } else {
      triangle([object.x1, object.y1, object.x2, object.y2, object.x3, object.y3], object.colorHex);
    }
  } else if (object.type == "rectangle") {
    if (object.x3 == undefined || object.y3 == undefined) {
      line(object.x1, object.y1, object.x2, object.y2);
    } else if (object.x4 == undefined || object.y3 == undefined) {
      triangle([object.x1, object.y1, object.x2, object.y2, object.x3, object.y3], object.colorHex);
    } else {
      rectangle([object.x1, object.y1, object.x2, object.y2, object.x3, object.y3, object.x4, object.y4], object.colorHex)
    }
  } else if (object.type == "polygon") {
    polygon(object.triangles, object.colorHex);
  }
  drawnItems.push(object);
}

function cancelDrawing() {
  objectBeingDrawn = {};
}

// drawer
function rerender() {
  console.log("======================================");
  drawBackground();

  // clear the canvas
  drawnItems = [];
  points = [];
  indexes = [];

  // draw based on objectToBeDrawn
  for (let i = 0; i < objectToBeDrawn.length; i++) {
    drawObject(objectToBeDrawn[i]);
  }
  // draw based on objectBeingDrawn
  if (objectBeingDrawn) {
    drawObject(objectBeingDrawn);
  }
}
export { rerender, createCanvas, finishDrawing, cancelDrawing, objectToBeDrawn, background, objectBeingDrawn, rectangle, triangle };
