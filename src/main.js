import { createCanvas, point, background, triangle, polygon, line, triangulate, drawnItems, convexHull, removeUnusedPoints } from "./helper.js";

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
  if (drawItemValue == "point") {
    point(x, y);
  }
  updateObjectList();
}

// add li to objectList from drawnItems
// update objectList
function updateObjectList() {
  objectList.innerHTML = "";
  for (let i = 0; i < drawnItems.length; i++) {
    let li = document.createElement("li");
    li.innerHTML = drawnItems[i].type;
    objectList.appendChild(li);
  }
}

/*======== Defining and storing the geometry ===========*/
point(0.4, 0.0);

line(0.8, 0.0, 0.8, 0.5);
point(0.0, 0.0);
line(0.4, 0.4, 0.7, 0.9);

point(0.4, 0.5);
updateObjectList();
