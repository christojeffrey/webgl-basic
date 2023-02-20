import { rerender, createCanvas, objectToBeDrawn, background } from "./helper.js";
function createPoint(x, y) {
  objectToBeDrawn.push({ type: "point", x, y });
}

function setBackground(r, g, b, a) {
  background.push(r, g, b, a);
}

export { createPoint, rerender, createCanvas, objectToBeDrawn, setBackground };
