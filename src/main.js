import { createCanvas, rerender, createPoint, objectToBeDrawn, setBackground } from "./mainInterface.js";

/*============== Creating a canvas ====================*/
let canvas = createCanvas(1000, 1400);

// listen for drawItem id dropdown value
let drawItem = document.getElementById("drawItem");
let objectList = document.getElementById("objectList");
let drawItemValue = "none";
drawItem.addEventListener("change", function () {
  drawItemValue = drawItem.value;
  console.log(drawItemValue);
});

// handle mouse events
canvas.onmousedown = handleMouseDown;
canvas.onmouseenter = handleMouseHover;

function handleMouseHover(e) {
  // change cursor to crosshair
  canvas.style.cursor = "crosshair";
}

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
      createPoint(x, y);
    } else if (drawItemValue == "line") {
      // objectToBeDrawn.push({ type: "line", x1, y1, x2, y2 })
    }
    rerender();
    updateObjectList();
  }
}

// update UI
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

// main
setBackground(0.0, 0.0, 0.0, 0.0);

createPoint(0.4, 0.0);
createPoint(0.8, 0.0);

rerender();
updateObjectList();
