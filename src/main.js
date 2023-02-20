import { createCanvas, rerender, createPoint, objectToBeDrawn, setBackground, createLine } from "./mainInterface.js";

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

let objectBeingDrawn = null;
let objectToBeMoved = null;

// handle mouse events
let isClicked = false;
canvas.onmousedown = handleMouseDown;
canvas.onmouseenter = handleMouseHover;

// click and drag
canvas.onmousemove = handleMouseMove;
canvas.onmouseup = handleMouseUp;

function handleMouseUp(e) {
  isClicked = false;
  objectToBeMoved = null;
}

const TOLERANCE = 0.01;

function handleMouseMove(e) {
  if (isClicked) {
    // handle drag and drop
    let x = e.clientX;
    let y = e.clientY;
    let rect = e.target.getBoundingClientRect();
    x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

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
              break;
            }
          }
        }
      }

      if (objectToBeMoved != null) {
        objectToBeMoved.x = x;
        objectToBeMoved.y = y;
        rerender();
      }
    } else {
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

let clickedIndex = null;
function updateObjectList() {
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

function setProperties() {
  // set properties based on clickedIndex
  let html;

  if (objectToBeDrawn[clickedIndex].type == "point") {
    let x = objectToBeDrawn[clickedIndex].x;
    let y = objectToBeDrawn[clickedIndex].y;
    let colorHex = objectToBeDrawn[clickedIndex].colorHex;
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
  }
}

// main
setBackground(0.0, 0.0, 0.0, 0.0);

createPoint(0.4, 0.0);
createPoint(0.8, 0.0, "#FFFF00");
createLine(0.4, 0.0, 0.8, 0.0);
rerender();
updateObjectList();
