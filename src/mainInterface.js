import { rerender, createCanvas, objectToBeDrawn, background } from "./helper.js";
function createPoint(x, y, colorHex) {
  objectToBeDrawn.push({
    type: "point",
    x,
    y,
    colorHex,
  });
}

function setBackground(r, g, b, a) {
  background.push(r, g, b, a);
}

function createLine(x1, y1, x2, y2) {
  objectToBeDrawn.push({
    type: "line",
    x1,
    y1,
    x2,
    y2,
  });
}
export { createPoint, rerender, createCanvas, objectToBeDrawn, setBackground, createLine };
