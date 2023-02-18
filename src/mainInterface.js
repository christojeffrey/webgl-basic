import { rerender, createCanvas, objectToBeDrawn } from "./helper.js";
function createPoint(x, y) {
  objectToBeDrawn.push({ type: "point", x, y });
}

export { createPoint, rerender, createCanvas, objectToBeDrawn };
