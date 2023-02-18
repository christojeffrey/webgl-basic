import { createCanvas, point, background, triangle, polygon, line, triangulate, convexHull, removeUnusedPoints, rerender, objectToBeDrawn } from "./helper.js";

/*============== Creating a canvas ====================*/
let canvas = createCanvas(1000, 1000);

// listen for drawItem id dropdown value
let drawItem = document.getElementById("drawItem");
let objectList = document.getElementById("objectList");

let drawItemValue = "none";
drawItem.addEventListener("change", function () {
  drawItemValue = drawItem.value;
  console.log(drawItemValue);
});
canvas.onmousedown = handleMouseDown;

function handleMouseDown(e) {
  let x = e.clientX;
  let y = e.clientY;
  let rect = e.target.getBoundingClientRect();
  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
  console.log("x", x);
  console.log("y", y);
  //  draw based on dropdown value
  if (drawItemValue != "none") {
    if (drawItemValue == "point") {
      // add to list of objects
      objectToBeDrawn.push({ type: "point", x, y });
    } else if (drawItemValue == "line") {
      // objectToBeDrawn.push({ type: "line", x1, y1, x2, y2 })
    }
    updateObjectList();
  }
  rerender();
}

// add li to objectList from objectToBeDrawn
// update objectList
function updateObjectList() {
  objectList.innerHTML = "";
  for (let i = 0; i < objectToBeDrawn.length; i++) {
    let li = document.createElement("li");
    li.innerHTML = objectToBeDrawn[i].type;
    objectList.appendChild(li);
  }
}

/*======== Defining and storing the geometry ===========*/
// point(0.4, 0.0);

// line(0.8, 0.0, 0.8, 0.5);
// point(0.0, 0.0);
// line(0.4, 0.4, 0.7, 0.9);
objectToBeDrawn.push({ type: "point", x: 0.4, y: 0.0 });
objectToBeDrawn.push({ type: "point", x: 0.8, y: 0.0 });
// triangle([0.0, 0.0, 0.4, 0.0, 0.4, 0.4], false);
console.log("testing!!!!!!!!!!!!!!!!!!!!");
// point(0.4, 0.5);
rerender();
updateObjectList();
