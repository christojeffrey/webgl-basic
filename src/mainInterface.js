import { rerender, createCanvas, objectToBeDrawn, background } from "./helper.js";
function createPoint(x, y, r, g, b, a) {
  objectToBeDrawn.push({
    type: "point",
    x,
    y,
    color: {
      r,
      g,
      b,
      a,
    },
  });
}

function setBackground(r, g, b, a) {
  background.push(r, g, b, a);
}

export { createPoint, rerender, createCanvas, objectToBeDrawn, setBackground };
