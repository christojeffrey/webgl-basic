import { createCanvas, rerender, cancelDrawing, createPoint, setBackground, finishDrawing, createLine, objectToBeDrawn, objectBeingDrawn } from "./mainInterface.js";
import { getXY } from "./utils.js";

const TOLERANCE = 0.01;

let objectToBeMoved = null;
let isDragging = false;
let clickedIndex = null;
let isDrawing = false;
let verticesDrawn = 0;
/*============== Creating a canvas ====================*/
let canvas = createCanvas(1000, 1200);

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

// click and drag
canvas.onmousemove = handleMouseMove;
canvas.onmouseup = handleMouseUp;

function handleMouseUp(e) {
  isDragging = false;
  objectToBeMoved = null;
}

// used to handle dragging, and drawing animation
function handleMouseMove(e) {
  if (isDragging) {
    // handle drag and drop
    const { x, y } = getXY(e, canvas);

    //  draw based on dropdown value
    if (drawItemValue == "none") {
      // handle moving object by dragging
      // get the object
      if (objectToBeMoved == null) {
        for (let i = 0; i < objectToBeDrawn.length; i++) {
          let item = objectToBeDrawn[i];

          // define where the object is
          if (item.type == "point") {
            if (Math.abs(item.x - x) < TOLERANCE && Math.abs(item.y - y) < TOLERANCE) {
              objectToBeMoved = item;
              clickedIndex = i;
              break;
            }
          }
        }
      }

      if (objectToBeMoved != null) {
        objectToBeMoved.x = x;
        objectToBeMoved.y = y;
        setProperties();

        rerender();
      }
    }
  }
  // adding animation when drawing
  if (verticesDrawn != 0) {
    const { x, y } = getXY(e, canvas);
    if (drawItemValue == "line") {
      // on the proccess drawing line
      objectBeingDrawn.x2 = x;
      objectBeingDrawn.y2 = y;
    } else if (drawItemValue == "triangle") {
      // on the proccess drawing triangle
      if (verticesDrawn == 1) {
        objectBeingDrawn.x2 = x;
        objectBeingDrawn.y2 = y;
      }
      if (verticesDrawn == 2) {
        objectBeingDrawn.x3 = x;
        objectBeingDrawn.y3 = y;
      }
    }
    rerender();
  }
}

// used to change cursor
function handleMouseHover(_) {
  // change cursor to crosshair
  canvas.style.cursor = "crosshair";
}

// used to handle drawing object
function handleMouseDown(e) {
  isDragging = true;
  const { x, y } = getXY(e, canvas);

  // draw based on dropdown value
  switch (drawItemValue) {
    case "none":
      break;
    case "point":
      // add to list of objects
      createPoint(x, y);
      break;
    case "line":
      // initiate drawing line
      if (verticesDrawn == 0) {
        objectBeingDrawn.type = "line";
        objectBeingDrawn.x1 = x;
        objectBeingDrawn.y1 = y;
        verticesDrawn++;
      } else if (verticesDrawn == 1) {
        objectBeingDrawn.x2 = x;
        objectBeingDrawn.y2 = y;
        finishDrawing();
        verticesDrawn = 0;
      }
      break;
    case "triangle":
      // initiate drawing triangle
      if (verticesDrawn == 0) {
        objectBeingDrawn.type = "triangle";
        objectBeingDrawn.x1 = x;
        objectBeingDrawn.y1 = y;
        verticesDrawn++;
      } else if (verticesDrawn == 1) {
        objectBeingDrawn.x2 = x;
        objectBeingDrawn.y2 = y;
        verticesDrawn++;
      } else if (verticesDrawn == 2) {
        objectBeingDrawn.x3 = x;
        objectBeingDrawn.y3 = y;
        finishDrawing();
        verticesDrawn = 0;
      }
      break;
  }

  rerender();
  updateObjectList();
}

// update UI
// update objectList on left nav
function updateObjectList() {
  // add li to objectList from objectToBeDrawn
  objectList.innerHTML = "";
  for (let i = 0; i < objectToBeDrawn.length; i++) {
    let li = document.createElement("li");
    li.innerHTML = objectToBeDrawn[i].type;
    li.setAttribute("data-index", i);
    li.addEventListener("click", function (e) {
      clickedIndex = e.target.getAttribute("data-index");
      console.log(clickedIndex);
      setProperties();
    });
    objectList.appendChild(li);
  }
}

// set properties on right nav
function setProperties() {
  // set properties based on clickedIndex
  let html;

  if (objectToBeDrawn[clickedIndex].type == "point") {
    let x = objectToBeDrawn[clickedIndex].x;
    let y = objectToBeDrawn[clickedIndex].y;
    let colorHex = objectToBeDrawn[clickedIndex].colorHex;
    // round x and y
    x = Math.round(x * 100) / 100;
    y = Math.round(y * 100) / 100;
    html = `
    <form id="pointProperties">
      <div id="properties-title">
        <h3>Point Properties</h3>
      </div>
      <div>
        <label for="x">x</label>
        <input id="x" value=${x} />
      </div>
      <div>
        <label for="y">y</label>
        <input id="y" value=${y} />
      </div>
      <div>
      <input type="color" id="colorHex" name="favcolor" value=${colorHex}>
      </div>
      <input type="submit">
      </form>
    `;
    let properties = document.getElementById("properties");
    properties.innerHTML = html;

    // add event listener to form
    let form = document.getElementById("pointProperties");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let x = document.getElementById("x").value;
      let y = document.getElementById("y").value;
      let colorHex = document.getElementById("colorHex").value;
      objectToBeDrawn[clickedIndex].x = x;
      objectToBeDrawn[clickedIndex].y = y;
      console.log("colorHex", colorHex);
      objectToBeDrawn[clickedIndex].colorHex = colorHex;
      rerender();
    });
  } else if (objectToBeDrawn[clickedIndex].type == "line") {
    let x1 = objectToBeDrawn[clickedIndex].x1;
    let y1 = objectToBeDrawn[clickedIndex].y1;
    let x2 = objectToBeDrawn[clickedIndex].x2;
    let y2 = objectToBeDrawn[clickedIndex].y2;
    let colorHex = objectToBeDrawn[clickedIndex].colorHex;
    html = `
    <form id="lineProperties">
      <div id="properties-title">
        <h3>Line Properties</h3>
      </div>
      <div>
        <label for="x1">x1</label>
        <input id="x1" value=${x1} />
      </div>
      <div>
        <label for="y1">y1</label>
        <input id="y1" value=${y1} />
      </div>
      <div>
        <label for="x2">x2</label>
        <input id="x2" value=${x2} />
      </div>
      <div>
        <label for="y2">y2</label>
        <input id="y2" value=${y2} />
      </div>
      <div>
      <input type="color" id="colorHex" name="favcolor" value=${colorHex}>
      </div>
      <input type="submit">
      </form>
    `;
    let properties = document.getElementById("properties");
    properties.innerHTML = html;

    // add event listener to form
    let form = document.getElementById("lineProperties");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let x1 = document.getElementById("x1").value;
      let y1 = document.getElementById("y1").value;
      let x2 = document.getElementById("x2").value;
      let y2 = document.getElementById("y2").value;
      let colorHex = document.getElementById("colorHex").value;
      objectToBeDrawn[clickedIndex].x1 = x1;
      objectToBeDrawn[clickedIndex].y1 = y1;
      objectToBeDrawn[clickedIndex].x2 = x2;
      objectToBeDrawn[clickedIndex].y2 = y2;
      objectToBeDrawn[clickedIndex].colorHex = colorHex;
      rerender();
    });
  }
}

// handle keyboard event
document.addEventListener("keydown", function (e) {
  if (e.key == "Escape") {
    cancelDrawing();
    isDrawing = false;
    rerender();
  }
});

// main
setBackground("#000000", 0);

createPoint(0.4, 0.0);
createPoint(0.8, 0.0, "#FFFF00");
createLine(0.4, 0.0, 0.8, 0.0);

rerender();
updateObjectList();
