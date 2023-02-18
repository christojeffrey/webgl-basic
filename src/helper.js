let canvas;
let gl;

let vertex_buffer;
let Index_Buffer;
let points = [];
let indexes = [];

// list of objects
let drawnItems = [];

let objectToBeDrawn = [];

function createCanvas(height = 1000, width = 1000) {
  canvas = document.createElement("canvas");
  canvas.id = "canvas";
  canvas.width = width;
  canvas.height = height;
  document.getElementById("root").appendChild(canvas);
  gl = canvas.getContext("webgl");

  canvas.onmouseenter = handleMouseHover;
  return document.getElementById("canvas");
}

function handleMouseHover(e) {
  // change cursor to crosshair
  canvas.style.cursor = "crosshair";
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
  var fragCode = "void main(void) {" + " gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);" + "}";

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
  // console.log("points", points);
  // console.log("indexes", indexes);

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
let iteration = 0;
function triangulate(sides) {
  // sides = [[0,0],[100,0],[100,100],[0,100]]
  let pointsNotDrawnYet = [];
  let possiblePointsToBeDrawn = [];
  let drawnLines = [];
  let triangles = [];

  // fill possiblePointsToBeDrawn with the coordinates of the polygon
  for (let i = 0; i < sides.length; i++) {
    possiblePointsToBeDrawn.push(sides[i]);
    pointsNotDrawnYet.push(sides[i]);
  }

  let isTherePointThatIsNotInTriangle = true;
  // while there are points that is not in the triangles, keep looping
  while (isTherePointThatIsNotInTriangle) {
    iteration++;
    if (iteration > 10) {
      break;
    }
    let trianglePointsCandidates = [];
    // consist of possible points to be drawn
    for (let i = 0; i < possiblePointsToBeDrawn.length; i++) {
      trianglePointsCandidates.push(possiblePointsToBeDrawn[i]);
    }
    console.log("trianglePointsCandidates before first point", trianglePointsCandidates);

    let firstPoint = pointsNotDrawnYet[0];
    // remove firstPoint from possiblePointsToBeDrawn
    trianglePointsCandidates = trianglePointsCandidates.filter((point) => point !== firstPoint);
    // get a second point, then test if it intersects with any of the lines.
    // if it does, then get another point
    console.log("trianglePointsCandidates before second point", trianglePointsCandidates);

    let secondPoint;
    let secondPointCandidate;
    for (let i = 0; i < trianglePointsCandidates.length; i++) {
      secondPointCandidate = trianglePointsCandidates[i];
      let isIntersecting = false;
      for (let j = 0; j < drawnLines.length; j++) {
        let line = drawnLines[j];
        if (isInterescting(firstPoint[0], firstPoint[1], secondPointCandidate[0], secondPointCandidate[1], line[0][0], line[0][1], line[1][0], line[1][1])) {
          isIntersecting = true;
          break;
        }
        // check if overlapping with any points
        for (let k = 0; k < sides.length; k++) {
          if (isOverlappingAPoint(firstPoint[0], firstPoint[1], secondPointCandidate[0], secondPointCandidate[1], sides[k][0], sides[k][1])) {
            isIntersecting = true;
            break;
          }
        }
      }

      if (!isIntersecting) {
        console.log("==FOUND SECOND POINT==", secondPointCandidate);
        secondPoint = secondPointCandidate;
        break;
      }
    }
    // if not, then add the line to the drawnLines.
    // remove secondPoint from possiblePointsToBeDrawn
    trianglePointsCandidates = trianglePointsCandidates.filter((point) => point !== secondPoint);
    drawnLines.push([firstPoint, secondPoint]);
    // continue get a third point. check if a line that is made between the first, second, and third point intersects with any of the lines.
    let thirdPoint;
    let thirdPointCandidate;
    console.log("trianglePointsCandidates before finding the third", trianglePointsCandidates);
    for (let i = 0; i < trianglePointsCandidates.length; i++) {
      thirdPointCandidate = trianglePointsCandidates[i];
      let isIntersecting = false;
      for (let j = 0; j < drawnLines.length; j++) {
        let line = drawnLines[j];
        if (isInterescting(firstPoint[0], firstPoint[1], thirdPointCandidate[0], thirdPointCandidate[1], line[0][0], line[0][1], line[1][0], line[1][1])) {
          // print the two intersecting lines
          // line ... is intersecting with line ...
          console.log("line", firstPoint, thirdPointCandidate, "is intersecting with line", line[0], line[1]);

          isIntersecting = true;
          break;
        }

        if (isInterescting(secondPoint[0], secondPoint[1], thirdPointCandidate[0], thirdPointCandidate[1], line[0][0], line[0][1], line[1][0], line[1][1])) {
          // print the two intersecting lines
          // line ... is intersecting with line ...
          console.log("line", secondPoint, thirdPointCandidate, "is intersecting with line", line[0], line[1]);
          isIntersecting = true;
          break;
        }
        // check if overlapping with any points
        for (let k = 0; k < sides.length; k++) {
          if (isOverlappingAPoint(firstPoint[0], firstPoint[1], thirdPointCandidate[0], thirdPointCandidate[1], sides[k][0], sides[k][1])) {
            isIntersecting = true;
            break;
          }
          if (isOverlappingAPoint(secondPoint[0], secondPoint[1], thirdPointCandidate[0], thirdPointCandidate[1], sides[k][0], sides[k][1])) {
            isIntersecting = true;
            break;
          }
        }
      }
      if (!isIntersecting) {
        thirdPoint = thirdPointCandidate;
        console.log("found third point", thirdPoint);
        break;
      }
    }

    // if not, then add the line to the drawnLines.
    // remove thirdPoint from trianglePointsCandidates
    trianglePointsCandidates = trianglePointsCandidates.filter((point) => point !== thirdPoint);
    // drawnLines cannot be undefined

    drawnLines.push([firstPoint, thirdPoint]);
    drawnLines.push([secondPoint, thirdPoint]);
    console.log("new triangle == ", firstPoint, secondPoint, thirdPoint);
    // add the triangle to the triangles
    // dont push if there is undefined
    // if (firstPoint && secondPoint && thirdPoint)
    triangles.push([firstPoint, secondPoint, thirdPoint]);
    pointsNotDrawnYet = pointsNotDrawnYet.filter((point) => point !== firstPoint && point !== secondPoint && point !== thirdPoint);
    // check if there are points that is not in the triangles

    // filter drawnLines to only have unique lines
    drawnLines = drawnLines.filter((line, index) => drawnLines.findIndex((line2) => line2[0] === line[0] && line2[1] === line[1]) === index);

    // update possiblePointsToBeDrawn. if there is a point that shown twice in drawnLines, then remove it from possiblePointsToBeDrawn

    // console.log
    console.log("==================================");
    console.log("triangle", triangles);
    console.log("drawnLines", drawnLines);
    console.log("pointsNotDrawnYet", pointsNotDrawnYet);
    console.log("possiblePointsToBeDrawn", possiblePointsToBeDrawn);

    if (pointsNotDrawnYet.length === 0) {
      isTherePointThatIsNotInTriangle = false;
    }
  }

  return triangles;
}

// returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function isInterescting(a, b, c, d, p, q, r, s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  }
}
// function isInterescting(x1, y1, x2, y2, x3, y3, x4, y4) {
//   // ignore if intersection is at the end point of a line
//   // check if line 1 intersects with line 2
//   // line 1: (x1, y1) to (x2, y2)
//   // line 2: (x3, y3) to (x4, y4)
//   // return true if intersecting, false if not

//   // calculate the direction of the lines
//   let d1x = x2 - x1;
//   let d1y = y2 - y1;
//   let d2x = x4 - x3;
//   let d2y = y4 - y3;

//   // calculate the cross product
//   let cross = d1x * d2y - d1y * d2x;

//   // if cross product is 0, then the lines are parallel
//   if (cross == 0) return false;

//   // calculate the point of intersection
//   let t1 = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
//   let t2 = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
//   let t = t1 / t2;

//   // calculate the x and y of the intersection point
//   let x = t * d1x;
//   let y = t * d1y;

//   // check if the x and y coordinates are within both lines
//   if (x < Math.min(x1, x2) || x > Math.max(x1, x2)) return false;
//   if (x < Math.min(x3, x4) || x > Math.max(x3, x4)) return false;

//   // ignore if intersection is at the end point of a line
//   if (x == x1 && y == y1) return false;
//   if (x == x2 && y == y2) return false;
//   if (x == x3 && y == y3) return false;
//   if (x == x4 && y == y4) return false;

//   return true;
// }
// convex hull
// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r) {
  let val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);

  if (val == 0) return 0; // collinear
  return val > 0 ? 1 : 2; // clock or counterclock wise
}

// Prints convex hull of a set of n points.
function convexHull(points) {
  let n = points.length;
  // There must be at least 3 points
  if (n < 3) return;

  // Initialize Result
  let hull = [];

  // Find the leftmost point
  let l = 0;
  for (let i = 1; i < n; i++) if (points[i][0] < points[l][0]) l = i;

  // Start from leftmost point, keep moving
  // counterclockwise until reach the start point
  // again. This loop runs O(h) times where h is
  // number of points in result or output.
  let p = l,
    q;
  do {
    // Add current point to result
    hull.push(points[p]);

    // Search for a point 'q' such that
    // orientation(p, q, x) is counterclockwise
    // for all points 'x'. The idea is to keep
    // track of last visited most counterclock-
    // wise point in q. If any point 'i' is more
    // counterclock-wise than q, then update q.
    q = (p + 1) % n;

    for (let i = 0; i < n; i++) {
      // If i is more counterclockwise than
      // current q, then update q
      if (orientation(points[p], points[i], points[q]) == 2) q = i;
    }

    // Now q is the most counterclockwise with
    // respect to p. Set p as q for next iteration,
    // so that q is added to result 'hull'
    p = q;
  } while (p != l); // While we don't come to first
  // point

  return hull;
}

function isOverlappingAPoint(x1, y1, x2, y2, x3, y3) {
  // console.log("--------------------");
  let flag = false;

  // return true if the line from (x1,y1)->(x2,y2) overlap with (x3,y3)

  // check if x3 y3 is somewhere on the line x1 y1 to x2 y2
  let slope1 = (y2 - y1) / (x2 - x1);
  let slope2 = (y3 - y1) / (x3 - x1);
  if (slope1 == slope2) {
    // if slope the same, then check if x3 is between x1 and x2 and y3 is between y1 and y2
    if (x3 >= Math.min(x1, x2) && x3 <= Math.max(x1, x2) && y3 >= Math.min(y1, y2) && y3 <= Math.max(y1, y2)) {
      // console.log("OVERLAP!", x1, y1, x2, y2, x3, y3);
      flag = true;
    }
  }
  // all point have to be different. if any of them are the same, return false;
  if (x1 == x2 && y1 == y2) flag = false;
  if (x1 == x3 && y1 == y3) flag = false;
  if (x2 == x3 && y2 == y3) flag = false;
  if (x3 == 0.0 && y3 == 0.5) {
    // console.log("!!!this is it, testing");
  }
  // console.log(x1, y1, x2, y2, x3, y3, flag);
  // console.log("--------------------");
  return flag;
}

function removeUnusedPoints(points) {
  // for every combination of points, check if they are overlapping
  // if isOverlappingAPoint is true, remove the point
  let newPoints = [];

  // copy the points array
  for (let i = 0; i < points.length; i++) {
    newPoints.push(points[i]);
  }
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < points.length; j++) {
      for (let k = 0; k < points.length; k++) {
        if (i != j && i != k && j != k) {
          if (isOverlappingAPoint(points[i][0], points[i][1], points[j][0], points[j][1], points[k][0], points[k][1])) {
            // remove point k
            console.log("removing point", points[k]);
            newPoints = newPoints.filter((item) => item !== points[k]);
          }
        }
      }
    }
  }
  return newPoints;
}

function rerender() {
  console.log("======================================");
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
      point(item.x, item.y);
    } else if (item.type == "line") {
      line(item.x1, item.y1, item.x2, item.y2);
    } else if (item.type == "triangle") {
      triangle(item.x1, item.y1, item.x2, item.y2, item.x3, item.y3);
    }
    drawnItems.push(item);
  }
}
export { createCanvas, point, background, triangle, polygon, line, triangulate, objectToBeDrawn, convexHull, removeUnusedPoints, rerender };
