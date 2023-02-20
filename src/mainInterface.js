import { rerender, createCanvas, finishDrawing, cancelDrawing, objectToBeDrawn, background, objectBeingDrawn } from "./helper.js";
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
export { createPoint, rerender, createCanvas, setBackground, createLine, finishDrawing, cancelDrawing, objectToBeDrawn, objectBeingDrawn };
