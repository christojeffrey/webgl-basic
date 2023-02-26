import { rerender, createCanvas, finishDrawing, cancelDrawing, objectToBeDrawn, background, objectBeingDrawn } from "./helper.js";
import { convexHull, removeUnusedPoints, triangulate } from "./polygonHelper.js";
function createPoint(x, y, colorHex) {
  objectToBeDrawn.push({
    type: "point",
    x,
    y,
    colorHex,
  });
}

function setBackground(colorHex, a) {
  background.colorHex = colorHex;
  background.a = a;
}

function createLine(x1, y1, x2, y2, colorHex) {
  objectToBeDrawn.push({
    type: "line",
    x1,
    y1,
    x2,
    y2,
    colorHex,
  });
}

function createPolygon(originalPoints) {
  // filter with convex hull
  // console.log("points", points);
  let points = convexHull(originalPoints);
  // console.log("convex hull", points);

  points = removeUnusedPoints(points);
  // console.log("remove unused points", points);

  let triangles = triangulate(points);

  // console.log("triangles", triangles);
  objectToBeDrawn.push({
    type: "polygon",
    triangles,
    points,
    originalPoints,
    colorHex: "#000FF0",
  });
}
export { createPoint, rerender, createCanvas, setBackground, createLine, finishDrawing, cancelDrawing, createPolygon, objectToBeDrawn, objectBeingDrawn };
