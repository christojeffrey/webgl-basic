import { createCanvas, rerender, createPoint, objectToBeDrawn, setBackground, createLine } from "./mainInterface.js";

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

let objectBeingDrawn = null;

// handle mouse events
let isClicked = false;
canvas.onmousedown = handleMouseDown;
canvas.onmouseenter = handleMouseHover;

// click and drag
canvas.onmousemove = handleMouseMove;
canvas.onmouseup = handleMouseUp;

function handleMouseUp(e) {
  isClicked = false;
}

function handleMouseMove(e) {
  if (isClicked) {
    let x = e.clientX;
    let y = e.clientY;
    let rect = e.target.getBoundingClientRect();
    x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
    console.log("x", x);
    console.log("y", y);

    //  draw based on dropdown value
    if (drawItemValue != "none") {
      if (drawItemValue == "line") {
        objectBeingDrawn.x2 = x;
        objectBeingDrawn.y2 = y;
        // pop previous line, add new line
        objectToBeDrawn.pop();
        objectToBeDrawn.push(objectBeingDrawn);

        rerender();
      }
    }
  }
}

function handleMouseHover(e) {
  // change cursor to crosshair
  canvas.style.cursor = "crosshair";
}

function handleMouseDown(e) {
  isClicked = true;
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
      objectBeingDrawn = {
        type: "line",
        x1: x,
        y1: y,
      };
      objectToBeDrawn.push(objectBeingDrawn);
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
createPoint(0.8, 0.0, 0.0, 1.0, 0.0, 1.0);
createLine(0.4, 0.0, 0.8, 0.0);
rerender();
updateObjectList();
